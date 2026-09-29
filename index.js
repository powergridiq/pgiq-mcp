#!/usr/bin/env node
// PowerGridIQ MCP server (Phase 1). Exposes the PGIQ Rating API as agent tools.
// Wraps the read-only REST API at https://powergridiq.com/api/v1.
// Run: `node index.js` (stdio). Configure in any MCP-capable agent (see README).

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

const BASE = process.env.PGIQ_API || "https://powergridiq.com/api/v1";
// Optional API key. Without it you're on the free tier (100 req/day per IP);
// set PGIQ_KEY=pk_live_... for a higher monthly quota.
const KEY = process.env.PGIQ_KEY || "";

async function api(path) {
  const headers = { Accept: "application/json" };
  if (KEY) headers.Authorization = "Bearer " + KEY;
  const r = await fetch(BASE + path, { headers });
  if (r.status === 429) throw new Error("PowerGridIQ rate limit reached. Set PGIQ_KEY=pk_live_... for a higher quota, or retry later.");
  if (!r.ok) throw new Error("PowerGridIQ API returned " + r.status + " for " + path);
  return r.json();
}

const TOOLS = [
  {
    name: "pgiq_markets",
    description:
      "List every rated power market with its PGIQ tier (1 Prime to 5 Largely closed), 0-100 score, and outlook. Start here to discover market ids.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "pgiq_rating",
    description:
      "Get the full PGIQ Rating and evidence for one market: five-pillar scores (access, availability, cost, momentum, carbon) with rationale, tier, outlook, confidence, thesis, peers, sources, and the latest rating action. Use for a deep read on a specific market.",
    inputSchema: {
      type: "object",
      properties: { market: { type: "string", description: "Market id, e.g. 'quebec', 'ercot', 'ireland'. Use pgiq_markets to list ids." } },
      required: ["market"],
    },
  },
  {
    name: "pgiq_best",
    description:
      "Get a ranked best-market decision for siting or scheduling a large electricity load (data center, AI cluster, industrial load). Re-weights the five pillars under a lens and returns the top markets with a one-line rationale. This is the decision endpoint.",
    inputSchema: {
      type: "object",
      properties: {
        lens: { type: "string", enum: ["default", "cost", "carbon", "momentum"], description: "Weighting lens. 'default' is carbon-light (hyperscaler/AI). 'carbon' favors clean grids, 'cost' favors cheap power, 'momentum' favors proven build-out." },
        group: { type: "string", enum: ["us", "canada", "europe", "middle_east", "latam", "asia", "oceania", "africa"], description: "Optional region filter." },
        min_tier: { type: "integer", description: "Only return markets at this tier or better (1=best, 5=worst)." },
        limit: { type: "integer", description: "Max results (default 5)." },
      },
    },
  },
  {
    name: "pgiq_screen",
    description:
      "Screen every rated market against hard constraints and return a VERDICT FOR EVERY MARKET IN SCOPE, not only the ones that pass. Use when the decision has firm limits (a cost ceiling, a required commercial operation date, a minimum tier, a minimum carbon score) rather than a weighting preference. Complements pgiq_best: pgiq_best ranks by lens, pgiq_screen decides. Read `summary` for the one-sentence answer, `results` for the qualifying set, and `rejected` and `insufficient_evidence` for everything that did not pass -- a failing market is REPORTED with its decisive reason, never silently dropped. CRITICAL DISTINCTION you must preserve: `does_not_qualify` means we measured it and it is outside the limit; `insufficient_evidence` means NO RECORD EXISTS and the market was never tested. Never report the second as a rejection or as evidence the market is unsuitable. `required_mw` is RECORDED BUT NOT TESTED -- no verdict confirms a market can physically serve the load, and you must reproduce that caveat when reporting a shortlist. Verdicts and decisive reasons are free at every tier; only the precise observed figures need a paid key (set PGIQ_KEY).",
    inputSchema: {
      type: "object",
      properties: {
        target_cod: { type: "string", description: "Required commercial operation date: a year (2030) or an ISO date. Send what the user actually said rather than converting to months yourself." },
        required_mw: { type: "number", description: "Load size in MW. RECORDED BUT NOT TESTED -- PowerGridIQ holds no local connectable-capacity evidence, so no verdict confirms a market can serve this load. Reproduce that caveat when reporting a shortlist." },
        min_evidence_depth: { type: "string", description: "Minimum evidence depth: M1, M2, M3 or M4." },
        max_cost: { type: "number", description: "Maximum recurring cost for the standard 100 MW case (95% load factor, transmission-level service), US dollars per MWh, excluding customer-funded connection capital. Markets above this are excluded." },
        max_months: { type: "integer", description: "Maximum typical time-to-connect, in months." },
        min_tier: { type: "integer", description: "Only return markets at this tier or better (1=best, 5=worst)." },
        min_carbon: { type: "integer", description: "Minimum carbon pillar score, 0-100 (higher is cleaner)." },
        group: { type: "string", enum: ["us", "canada", "europe", "middle_east", "latam", "asia", "oceania", "africa"], description: "Optional region filter." },
      },
    },
  },
  {
    name: "pgiq_developments",
    description:
      "Recent dated, cited grid developments (moratoria, tariffs, queue reforms, big builds) across markets, newest first. Optionally filter to one market.",
    inputSchema: {
      type: "object",
      properties: { market: { type: "string", description: "Optional market id to filter to." } },
    },
  },
  {
    name: "pgiq_grid",
    description:
      "Grid snapshot for one market: average operational carbon intensity (gCO2/kWh, location-based; not marginal, lifecycle or market-based Scope 2), price, fuel mix, demand, a system-level firm margin estimate (NOT local connectable capacity at a substation) and peak stress. The inputs for carbon- and cost-aware scheduling.",
    inputSchema: {
      type: "object",
      properties: { market: { type: "string", description: "Market id, e.g. 'quebec'." } },
      required: ["market"],
    },
  },
  {
    name: "pgiq_cheapest_window",
    description:
      "The cheapest hours to run a flexible load. With a market, returns its typical daily price shape and cheapest window; without one, returns the cheapest grids ranked by trough price. Modelled daily shape, not a real-time forecast.",
    inputSchema: {
      type: "object",
      properties: { market: { type: "string", description: "Optional market id. Omit for the cross-market ranking." } },
    },
  },
  {
    name: "pgiq_price_index",
    description:
      "European wholesale day-ahead power prices over time: the PowerGridIQ European Day-Ahead Power Price Index (Preview). Answers 'are European wholesale power prices rising or easing, over what period, and by how much', as an equal-weighted EUR/MWh basket across 23 European bidding zones indexed to July 2026 = 100. READ THE `signal` OBJECT FIRST: it carries the direction, the exact week described, the EUR/MWh average, how that sits against the July 2026 baseline, and what cannot be concluded. If signal.status is 'latest_complete_fallback' the headline describes an OLDER complete week and signal.is_current is false -- report signal.latest_daily_context alongside it, or the answer will be misleading even though every number is correct. DO NOT quote `change_1d` as a direction: it is the step between the last two complete delivery days, and day-ahead power has a weekly shape, so a weekday-to-weekend step reads as a large fall that is the calendar rather than the market. Its `comparability` field says which case it is, and `days_apart` can exceed 1 when a delivery day was skipped. This is a WHOLESALE price, not the delivered electricity cost a large load pays; for delivered cost use pgiq_rating and the realized_cost field.",
    inputSchema: {
      type: "object",
      properties: {
        include_series: {
          type: "boolean",
          description: "Include the full daily series. Default false, which returns the signal, the latest day and the windows only -- enough for almost every question and far smaller.",
        },
      },
    },
  },
  {
    name: "pgiq_cost_history",
    description:
      "What changed in one market's recurring electricity cost record, and WHO moved: the market, or PowerGridIQ. Use whenever a user asks why a cost figure differs from one they saw before, or whether a market has got more expensive. CRITICAL: only the class `economic_change` means the market moved. `source_revision`, `input_replacement`, `input_regression`, `methodology_change`, `evidence_state_change` and `correction` all mean PowerGridIQ changed what it reads or repaired what it published, and reporting any of them as a price movement is wrong -- a stale planning year being replaced looks exactly like a 42% collapse in capacity prices if you plot it. `first_observation` carries is_change:false and is where the record begins, not a change. `recorded:false` means this market is not snapshotted at all, which is a gap in coverage and NOT a finding that its costs have been stable; do not report it as one. What changed, when, and who moved are free; the figures at each point in time need a paid key (set PGIQ_KEY).",
    inputSchema: {
      type: "object",
      properties: {
        market: { type: "string", description: "Market id, e.g. miso. Use pgiq_markets for valid ids." },
      },
      required: ["market"],
    },
  },
];

//  WHAT IS IN THIS FILE, AND WHAT IS ACTUALLY RUNNING. Recorded because they are not the same
//  thing and nothing else tracks the difference.
//
//  On 20 September 2026 the connected PowerGridIQ MCP server exposed six tools: pgiq_markets,
//  pgiq_rating, pgiq_best, pgiq_developments, pgiq_grid, pgiq_cheapest_window. This file, at
//  version 1.2.0, declares nine. The three not live are:
//
//      pgiq_price_index    -- the European day-ahead index. "Expose the price index over MCP" has
//                             been carried as an open Phase 0 gate; the tool has existed for some
//                             time. The gate was never an engineering task. It was an upload.
//      pgiq_screen         -- hard-constraint screening with a verdict for every market.
//      pgiq_cost_history   -- what changed in a market's cost record, and who moved.
//
//  All three were verified against live production on 20 September 2026: /screen, /cost-history/
//  and /price-index each return 200 with the shape the handlers expect. The code is not the
//  blocker and has not been for a while.
//
//  HOW TO CHECK WHAT IS LIVE, since this file cannot: install or restart the server and list the
//  tools it advertises (any MCP client's tools/list; in Claude the server's tool names appear
//  directly). If pgiq_price_index is among them, this note is stale and should be updated or
//  deleted rather than left to rot.
//
//  WHY THE NOTE EXISTS AT ALL. A finished tool sitting in a staging folder is indistinguishable,
//  from inside the repo, from a finished tool that is live. Three of them sat that way while the
//  work read as incomplete. An unknown that is dated and written down is a different thing from
//  one nobody has noticed.
const PUBLISHED_STATE = Object.freeze({
  as_of: "2026-09-20",
  file_version: "1.2.0",
  believed_live: ["pgiq_markets", "pgiq_rating", "pgiq_best", "pgiq_developments",
                  "pgiq_grid", "pgiq_cheapest_window"],
  believed_not_live: ["pgiq_price_index", "pgiq_screen", "pgiq_cost_history"],
  endpoints_verified_live: ["/screen", "/cost-history/{market}", "/price-index", "/best"],
  how_to_check: "Restart the server and list the tools it advertises (tools/list). If "
              + "pgiq_price_index appears, update this block.",
});

const server = new Server({ name: "powergridiq", version: "1.2.0" }, { capabilities: { tools: {} } });

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
    } else if (name === "pgiq_cheapest_window") {
      data = await api("/cheapest-window" + (a.market ? "?market=" + encodeURIComponent(a.market) : ""));
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
