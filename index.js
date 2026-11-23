#!/usr/bin/env node
// PowerGridIQ MCP server 1.3.0. Exposes the PGIQ Rating API as agent tools.
// Wraps the read-only REST API at https://powergridiq.com/api/v1.
// Run: `node index.js` (stdio). Configure in any MCP-capable agent (see README).

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

const BASE = process.env.PGIQ_API || "https://powergridiq.com/api/v1";
// Optional API key. Without it you're on the free tier (100 req/day per IP);
// set PGIQ_KEY=pk_live_... for a higher monthly quota.
const KEY = process.env.PGIQ_KEY || "";

//  Every request names this server and the MCP client that launched it (from the MCP handshake,
//  e.g. "claude-ai/0.1.0"), so PowerGridIQ can count agent use by client. Software names only:
//  nothing about the user, the conversation or the machine is sent.
async function api(path) {
  const headers = { Accept: "application/json", "User-Agent": "pgiq-mcp/" + VERSION };
  try {
    const c = server.getClientVersion();
    if (c && c.name) headers["X-PGIQ-MCP-Client"] = String(c.name + "/" + (c.version || "")).slice(0, 60);
  } catch { /* before the handshake: no client name to send */ }
  if (KEY) headers.Authorization = "Bearer " + KEY;
  const r = await fetch(BASE + path, { headers });
  if (r.status === 429) throw new Error("PowerGridIQ rate limit reached. Set PGIQ_KEY=pk_live_... for a higher quota, or retry later.");
  if (!r.ok) throw new Error("PowerGridIQ API returned " + r.status + " for " + path);
  return r.json();
}

//  Shared wording, so every tool says the same thing about units, dates and absence. NO TYPED COUNTS
//  anywhere in a description: "67 markets" and "23 zones" went stale here before. Counts come from
//  the API at call time (pgiq_markets returns count).
const ARCHETYPE = "Cost figures are for the standard case: a 100 MW load at 95% load factor on high-voltage (transmission-level) service, US dollars per MWh, delivered (not wholesale).";
const FIGURES = "Responses from API schema 1.1 onward also carry figures.{field} = {value, unit, as_of (ISO date or month), source, method, confidence, stable_id, report_url}: when present, quote the unit and as_of from it, and a null value there carries figures.{field}.absence -- insufficient_evidence (not enough evidence), structurally_unavailable (does not exist there, e.g. no wholesale market), not_collected (exists, not held) or withheld (paid) -- with reason_text; report which one. Older responses have no figures object: take the unit from the field name or field_provenance and the date from as_of. Either way, never report an absent value as zero; say it is not held.";
const REGIONS = ["us", "canada", "europe", "middle_east", "latam", "asia", "oceania", "africa"];
const MARKET = (req) => ({ type: "object", properties: { market: { type: "string", description: "Market id (public slug), e.g. 'ontario', 'ercot', 'ireland'. Use pgiq_markets to list ids." } }, ...(req ? { required: ["market"] } : {}) });

const TOOLS = [
  {
    name: "pgiq_markets",
    description: "List every rated power market with its PGIQ tier (1 Prime to 5 Largely closed), 0-100 PGIQ Rating, Fundamentals score and outlook, as of the rating vintage (as_of). No cost fields; use pgiq_rating or pgiq_screen for cost. Start here to discover market ids. " + FIGURES,
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "pgiq_rating",
    description: "The full PGIQ Rating and evidence for one market: pillar scores (0-100) with rationale, tier, outlook, confidence, delivered cost (realized_cost, USD/MWh), connection timing, reliability, sources, report_url and the latest rating action. " + ARCHETYPE + " " + FIGURES,
    inputSchema: MARKET(true),
  },
  {
    name: "pgiq_best",
    description: "A ranked shortlist for siting or scheduling a large electricity load under a lens. Returns the top markets with score, lens_score (0-100), tier and a one-line why. It ranks; it does not certify that a site can connect. " + FIGURES,
    inputSchema: {
      type: "object",
      properties: {
        lens: { type: "string", enum: ["default", "cost", "carbon", "momentum"], description: "Weighting lens. 'default' is carbon-light; 'carbon' favours clean grids, 'cost' cheap delivered power, 'momentum' proven build-out." },
        group: { type: "string", enum: REGIONS, description: "Optional region filter." },
        min_tier: { type: "integer", description: "Only markets at this tier or better (1=best, 5=worst)." },
        limit: { type: "integer", description: "Max results (default 5)." },
      },
    },
  },
  {
    name: "pgiq_screen",
    description:
      "Screen every rated market against hard constraints and return a VERDICT FOR EVERY MARKET IN SCOPE, not only the ones that pass. Use when the decision has firm limits (a cost ceiling, a required commercial operation date, a minimum tier, a minimum carbon score) rather than a weighting preference. Complements pgiq_best: pgiq_best ranks by lens, pgiq_screen decides. Read `summary` for the one-sentence answer, `results` for the qualifying set, and `rejected` and `insufficient_evidence` for everything that did not pass -- a failing market is REPORTED with its decisive reason, never silently dropped. CRITICAL DISTINCTION you must preserve: `does_not_qualify` means we measured it and it is outside the limit; `insufficient_evidence` means NO RECORD EXISTS and the market was never tested. Never report the second as a rejection or as evidence the market is unsuitable. `required_mw` is RECORDED BUT NOT TESTED -- no verdict confirms a market can physically serve the load, and you must reproduce that caveat when reporting a shortlist. Verdicts and decisive reasons are free at every tier; only the precise observed figures need a paid key (set PGIQ_KEY)." + ARCHETYPE + " " + FIGURES,
    inputSchema: {
      type: "object",
      properties: {
        target_cod: { type: "string", description: "Required commercial operation date: a year (2030) or an ISO date, as the user said it." },
        required_mw: { type: "number", description: "Load size in MW. Recorded but not tested." },
        min_evidence_depth: { type: "string", description: "Minimum evidence depth: M1, M2, M3 or M4." },
        max_cost: { type: "number", description: "Maximum delivered recurring cost for the standard case, USD/MWh (100 MW, 95% load factor, HV), excluding customer-funded connection capital." },
        max_months: { type: "integer", description: "Maximum typical time-to-connect, in months." },
        min_tier: { type: "integer", description: "Only markets at this tier or better (1=best, 5=worst)." },
        min_carbon: { type: "integer", description: "Minimum carbon pillar score, 0-100 (higher is cleaner)." },
        group: { type: "string", enum: REGIONS, description: "Optional region filter." },
      },
    },
  },
  {
    name: "pgiq_claims",
    description: "The typed, sourced claims behind one market's rating: each has claim_id, predicate, value, unit, as_of, method, confidence and sources. Newer responses add a copy-paste `citation` ending in a permanent URL; when it is absent, cite the claim's own sources and claim_id. Use to quote a specific finding with attribution. The response also lists `gaps` (see pgiq_gaps). " + FIGURES,
    inputSchema: MARKET(true),
  },
  {
    name: "pgiq_gaps",
    description: "What PowerGridIQ does NOT hold for one market: the decision predicates with no claim, and why. A gap is not evidence that a risk is absent; say so when you report it.",
    inputSchema: MARKET(true),
  },
  {
    name: "pgiq_actions",
    description: "Rating actions (new rating, affirmed, upgrade, downgrade, outlook change), newest vintages included, each with `date` (month label) and the trigger; newer responses add `date_iso` (ISO month or day) and `date_precision`. Optionally filter to one market.",
    inputSchema: MARKET(false),
  },
  {
    name: "pgiq_developments",
    description: "Dated, cited grid developments (moratoria, tariffs, queue reforms, large builds) across markets. An announcement is not delivery; each row says its stage. Rows sharing an event_id are one real-world event: do not count them twice or sum their MW. Optionally filter to one market. " + FIGURES,
    inputSchema: MARKET(false),
  },
  {
    name: "pgiq_grid",
    description: "Grid snapshot for one market: average operational carbon intensity (gCO2/kWh, derived from the fuel mix, not measured), a modelled wholesale price baseline (USD/MWh; no live price feed exists in any market), fuel mix, demand and capacity (MW), a system-level firm margin (NOT local connectable capacity) and peak stress (%). Read field_provenance before quoting a number. " + FIGURES,
    inputSchema: MARKET(true),
  },
  {
    name: "pgiq_price_index",
    description:
      "European wholesale day-ahead power prices over time: the PowerGridIQ European Day-Ahead Power Price Index (Preview). Answers 'are European wholesale power prices rising or easing, over what period, and by how much', as an equal-weighted EUR/MWh basket across the European bidding zones it covers (the response lists them) indexed to July 2026 = 100. READ THE `signal` OBJECT FIRST: it carries the direction, the exact week described, the EUR/MWh average, how that sits against the July 2026 baseline, and what cannot be concluded. If signal.status is 'latest_complete_fallback' the headline describes an OLDER complete week and signal.is_current is false -- report signal.latest_daily_context alongside it, or the answer will be misleading even though every number is correct. DO NOT quote `change_1d` as a direction: it is the step between the last two complete delivery days, and day-ahead power has a weekly shape, so a weekday-to-weekend step reads as a large fall that is the calendar rather than the market. Its `comparability` field says which case it is, and `days_apart` can exceed 1 when a delivery day was skipped. This is a WHOLESALE price, not the delivered electricity cost a large load pays; for delivered cost use pgiq_rating and the realized_cost field.",
    inputSchema: {
      type: "object",
      properties: {
        include_series: { type: "boolean", description: "Include the full daily series. Default false: the signal, latest day and windows only." },
      },
    },
  },
  {
    name: "pgiq_cost_history",
    description:
      "What changed in one market's recurring electricity cost record, and WHO moved: the market, or PowerGridIQ. Use whenever a user asks why a cost figure differs from one they saw before, or whether a market has got more expensive. CRITICAL: only the class `economic_change` means the market moved. `source_revision`, `input_replacement`, `input_regression`, `methodology_change`, `evidence_state_change` and `correction` all mean PowerGridIQ changed what it reads or repaired what it published, and reporting any of them as a price movement is wrong -- a stale planning year being replaced looks exactly like a 42% collapse in capacity prices if you plot it. `first_observation` carries is_change:false and is where the record begins, not a change. `recorded:false` means this market is not snapshotted at all, which is a gap in coverage and NOT a finding that its costs have been stable; do not report it as one. What changed, when, and who moved are free; the figures at each point in time need a paid key (set PGIQ_KEY)." + ARCHETYPE,
    inputSchema: MARKET(true),
  },
];

//  WHAT IS IN THIS FILE, AND WHAT IS ACTUALLY RUNNING. Recorded because they are not the same
//  thing and nothing else tracks the difference.
//
//  1.3.0 (30 September 2026), prepared for release. Adds pgiq_claims, pgiq_gaps and pgiq_actions;
//  removes pgiq_cheapest_window (decision D10: an illustrative multiplier on a modelled baseline,
//  not an observed price series); descriptions state the cost archetype, units, as_of and what an
//  absent value means, with no typed counts. Every endpoint it calls answers on production today;
//  the figure contract, claim citations and ISO action dates are described as present only on newer
//  responses, so the tools read correctly before and after that API change deploys. MIT licence
//  (the client code only; the data it fetches is governed by the PowerGridIQ terms).
//  NOT yet published: npm still serves 1.1.0, and the GitHub copy uploaded 29 September carries the
//  earlier nine-tool 1.2.0.
//
//  HOW TO CHECK WHAT IS LIVE, since this file cannot: install or restart the server and list the
//  tools it advertises (any MCP client's tools/list). If pgiq_claims is among them, this revision
//  is live and this block should be updated.
const PUBLISHED_STATE = Object.freeze({
  as_of: "2026-09-30",
  file_version: "1.3.0",
  npm_serves: "1.1.0",
  github_repository: { serves_file_version: "1.2.0", verified: "2026-09-30", tools: 9,
                       note: "earlier tool set, still including pgiq_cheapest_window" },
  believed_live: ["pgiq_markets", "pgiq_rating", "pgiq_best", "pgiq_developments",
                  "pgiq_grid", "pgiq_cheapest_window"],
  believed_not_live: ["pgiq_price_index", "pgiq_screen", "pgiq_cost_history",
                      "pgiq_claims", "pgiq_gaps", "pgiq_actions"],
  not_live_because: "1.3.0 is prepared; npm publication and the registry listing need the owner's npm and registry logins",
  endpoints_verified_live: ["/screen", "/cost-history/{market}", "/price-index", "/best",
                            "/markets/{market}/claims", "/actions"],
  how_to_check: "Restart the server and list the tools it advertises (tools/list). If "
              + "pgiq_claims appears, update this block.",
});

const VERSION = "1.3.0";
const server = new Server({ name: "powergridiq", version: "1.3.0" }, { capabilities: { tools: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: a = {} } = req.params;
  try {
    let data;
    if (name === "pgiq_markets") data = await api("/markets");
    else if (name === "pgiq_rating") data = await api("/ratings/" + encodeURIComponent(a.market || ""));
    else if (name === "pgiq_best") {
      const q = new URLSearchParams();
      for (const k of ["lens", "group", "min_tier", "limit"]) if (a[k] != null) q.set(k, String(a[k]));
      data = await api("/best" + (q.toString() ? "?" + q.toString() : ""));
    } else if (name === "pgiq_screen") {
      const q = new URLSearchParams();
      for (const k of ["max_cost", "max_months", "target_cod", "required_mw", "min_tier", "min_carbon", "group", "min_evidence_depth"]) if (a[k] != null) q.set(k, String(a[k]));
      data = await api("/screen" + (q.toString() ? "?" + q.toString() : ""));
    } else if (name === "pgiq_cost_history") {
      data = await api("/cost-history/" + encodeURIComponent(a.market || ""));
    } else if (name === "pgiq_developments") {
      data = await api("/developments" + (a.market ? "?market=" + encodeURIComponent(a.market) : ""));
    } else if (name === "pgiq_grid") {
      data = await api("/grid/" + encodeURIComponent(a.market || ""));
    } else if (name === "pgiq_claims") {
      data = await api("/markets/" + encodeURIComponent(a.market || "") + "/claims");
    } else if (name === "pgiq_gaps") {
      const d = await api("/markets/" + encodeURIComponent(a.market || "") + "/claims");
      data = { market_id: d.market_id, gaps: d.gaps, note: d.note,
               means: "Predicates PowerGridIQ does not hold for this market. A gap is not evidence that a risk is absent." };
    } else if (name === "pgiq_actions") {
      data = await api("/actions" + (a.market ? "?market=" + encodeURIComponent(a.market) : ""));
    } else if (name === "pgiq_price_index") {
      data = await api("/price-index");
      //  The daily series grows by a row a day and almost no question needs it. Dropping it by
      //  default keeps the tool result small enough to actually reason over; the signal, the latest
      //  day and both windows survive. No row count appears here on purpose: it was written as
      //  "47 rows" and was wrong within a fortnight.
      if (data && !a.include_series) {
        const n = Array.isArray(data.series) ? data.series.length : 0;
        delete data.series;
        data.series_omitted = n + " daily rows omitted; call with include_series true for the full series";
      }
    } else throw new Error("unknown tool: " + name);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  } catch (e) {
    return { content: [{ type: "text", text: "Error: " + e.message }], isError: true };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("PowerGridIQ MCP server running (stdio). API base: " + BASE);
