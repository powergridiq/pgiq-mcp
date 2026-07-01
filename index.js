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
      "Grid snapshot for one market: carbon intensity (gCO2/kWh), price, fuel mix, demand, firm headroom and peak stress. The inputs for carbon- and cost-aware scheduling.",
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
];

const server = new Server({ name: "powergridiq", version: "1.0.0" }, { capabilities: { tools: {} } });

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
    } else if (name === "pgiq_developments") {
      data = await api("/developments" + (a.market ? "?market=" + encodeURIComponent(a.market) : ""));
    } else if (name === "pgiq_grid") {
      data = await api("/grid/" + encodeURIComponent(a.market || ""));
    } else if (name === "pgiq_cheapest_window") {
      data = await api("/cheapest-window" + (a.market ? "?market=" + encodeURIComponent(a.market) : ""));
    } else throw new Error("unknown tool: " + name);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  } catch (e) {
    return { content: [{ type: "text", text: "Error: " + e.message }], isError: true };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("PowerGridIQ MCP server running (stdio). API base: " + BASE);
