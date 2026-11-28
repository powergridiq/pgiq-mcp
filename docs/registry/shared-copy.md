# Shared listing copy

Use this wording, or a shortened form of it, on every directory. Do not add a market count (the official 1.1.0 entry's "67 power markets" is already wrong, and the live `list_markets` count can move). Do not use wording that treats a rating, a rank, or a cost figure as an endorsement or a connection guarantee.

Figures below were checked against the live site, `/legal`, `/pricing`, `/build`, and `POST https://powergridiq.com/mcp` on 28 November 2026.

## Name

- Display name: **PowerGridIQ**
- Official registry name (do not change): `io.github.powergridiq/pgiq-mcp`
- npm package: `pgiq-mcp` version **1.3.0**
- Hosted endpoint: `https://powergridiq.com/mcp`

## Short description (100 characters, official registry limit)

Power-market ratings, delivered cost, claims and gaps for siting a large electricity load.

(89 characters. This is the text already published on official registry version 1.3.0.)

## Longer description

PowerGridIQ publishes power-market ratings, delivered-cost bands, connection waits, sourced claims and evidence gaps, so an agent or a person can screen where to site or schedule a large electricity load.

This listing covers two interfaces to the same public dataset:

- The npm package `pgiq-mcp` 1.3.0, which runs locally over stdio and wraps the read-only REST API at `https://powergridiq.com/api/v1`. Its tools use the `pgiq_` prefix.
- The hosted MCP server at `https://powergridiq.com/mcp`, which speaks streamable HTTP (JSON-RPC over `POST`). It currently reports version 0.2.0 and lists 18 tools with unprefixed names. `connection_wait` is not yet available on the hosted server.

The PGIQ Rating is a directional screen, not a connection guarantee, and not an endorsement of any market, operator, utility or price. Every market carries a confidence level. Cost figures are for the standard case: a 100 MW load at 95% load factor on high-voltage (transmission-level) service, in US dollars per MWh, delivered, not wholesale. Absent values are not zero; they are reported as a stated absence.

Single-market numbers, including a cost midpoint, are free on every surface (Paul's D1 Option A, approved 28 November 2026). The paywall applies to outputs: the full cross-market ranking beyond the free top ten, quarter-over-quarter movement, history, exports, alerts, and the full memo. Compare is 2 markets free and 4 with an Analyst Desk key. The hosted `draft_memo` tool is Desk-only; without a Desk key it returns an upgrade error, and with one it currently reports that the API memo is not built yet (HTTP 501) and points to the Desk print export.

Some live tool descriptions on `/mcp` still mention withheld midpoints or scores on list-style calls. That wording may lag the approved D1 rule until the Task 4 consistency work is merged. Listings should follow D1, not the lagging tool text.

## Authentication and limits

- **No key is required** for the free tier: **100 requests per UTC day per IP address**. Confirmed on `/legal` ("The free API allows 100 requests per UTC day per IP address, with no key") and `/build`.
- **Optional paid volume keys** (Developer $29/month for 25,000 requests, Pro $199/month for 500,000 requests) raise the quota. These are machine-access plans. `/pricing` states they do not include Analyst Desk data. Request or subscribe via [https://powergridiq.com/pricing](https://powergridiq.com/pricing) or hello@powergridiq.com. For the stdio package, set `PGIQ_KEY`. For the hosted endpoint, send `Authorization: Bearer <key>`.
- **Analyst Desk** is the paid-output plan for people ($600/month or $6,000/year on `/pricing` as of this draft). A Desk key is what unlocks paid outputs such as a 3- or 4-market compare and the full memo.
- **Self-serve free API keys** at 100 requests/day per key are approved to be built (D11) and are **not offered yet**. Say "coming" only, never "available".
- Usage-based billing has a switch in the plan and must stay **off** until Paul approves turning it on.

## npm / stdio tools (`pgiq-mcp` 1.3.0)

From the published README on `main` (commit `64c42100`, 23 November 2026):

- `pgiq_markets` — list every rated market (id, tier, score, outlook). Start here.
- `pgiq_rating(market)` — full rating and evidence for one market, including delivered cost.
- `pgiq_best(lens?, group?, min_tier?, limit?)` — a ranked shortlist. `lens` is `default|cost|carbon|momentum`. It ranks; it does not certify.
- `pgiq_screen(...)` — a verdict for every market against hard limits: qualifies, does not qualify (with reason), or insufficient evidence.
- `pgiq_claims(market)` — the sourced claims behind a rating.
- `pgiq_gaps(market)` — what PowerGridIQ does not hold for a market. A gap is not evidence that a risk is absent.
- `pgiq_actions(market?)` — rating actions (new, affirmed, upgrade, downgrade, outlook change).
- `pgiq_developments(market?)` — dated, cited grid developments.
- `pgiq_grid(market)` — grid snapshot: carbon intensity (derived from the fuel mix, not measured), a modelled wholesale baseline, fuel mix, demand, system-level firm margin (not local connectable capacity), peak stress.
- `pgiq_price_index(include_series?)` — the European Day-Ahead Power Price Index (wholesale, EUR/MWh; preview).
- `pgiq_cost_history(market)` — what changed in a market's cost record, and whether the market or PowerGridIQ moved.

Removed in 1.3.0: `pgiq_cheapest_window`. Do not list it.

## Hosted `/mcp` tools (18, captured 28 November 2026)

Short labels for directories. Full live descriptions are in `captures/hosted-tools-list.json`.

1. `list_markets` — every rated market, with tier, score, Fundamentals score, outlook and vintage. Start here to find market ids.
2. `search_markets` — resolve a typed name or alias to a market id.
3. `get_market` — the PGIQ Rating and evidence for one market, including delivered cost and the report URL. Same as `GET /api/v1/ratings/{market}`.
4. `best` — a ranked shortlist under a lens. The order is free; it ranks and does not certify.
5. `screen` — a verdict for every rated market against hard limits. `does_not_qualify` is measured and outside the limit; `insufficient_evidence` means the market was not tested.
6. `compare_markets` — two markets side by side (up to four with a Desk key), in the order given; never a ranking.
7. `draft_memo` — the cited comparison memo and export. Analyst Desk only; the API memo is not built yet (HTTP 501) even with a Desk key.
8. `claims` — typed, sourced claims behind one market's rating.
9. `cite` — the citation record for one claim id, including permalink and sources.
10. `gaps` — what PowerGridIQ does not hold for one market, with a question to put to the utility.
11. `rating_actions` — rating actions, optionally for one market.
12. `developments` — dated, cited grid developments. An announcement is not delivery.
13. `whats_changed` — dated, cited changes, newest first, including unverified items flagged rather than dropped.
14. `policy_and_tariff_changes` — scheduled, pending and dated regulatory items from the change list.
15. `grid` — grid snapshot for one market (see the stdio `pgiq_grid` caveats).
16. `price_index` — European Day-Ahead Power Price Index (preview).
17. `cost_history` — what changed in one market's recurring cost record, and who moved it.
18. `delivered_cost` — delivered cost for a stated load in one market, same as `GET /api/v1/cost/quote`. Read `state` and `applies_to_request` first; do not scale the declared-case band.

Not yet available on the hosted server: `connection_wait`.

## Privacy note (for listing forms)

PowerGridIQ's terms are at [https://powergridiq.com/legal](https://powergridiq.com/legal). The no-key tier is limited by IP address (100 requests per UTC day). Optional keys should be kept private. The stdio package sends `User-Agent: pgiq-mcp/<version>` and `X-PGIQ-MCP-Client: <client name>/<version>` from the MCP handshake so use can be counted by client software name; the package README states this is software names only, not the person, the conversation, or the machine. Hosted MCP calls are HTTPS requests to `powergridiq.com` and are subject to the same API and legal terms as the REST API. The site does not sell or share personal information with third parties for their own use. Most web pages currently load Google Analytics; that is a site matter, not a requirement of the MCP tools.

## Links

- Hosted MCP: https://powergridiq.com/mcp
- Developer page: https://powergridiq.com/build
- OpenAPI: https://powergridiq.com/openapi.json
- Agent map: https://powergridiq.com/llms.txt
- Terms: https://powergridiq.com/legal
- Pricing: https://powergridiq.com/pricing
- Methodology: https://powergridiq.com/methodology
- Source (stdio package): https://github.com/powergridiq/pgiq-mcp
- npm: https://www.npmjs.com/package/pgiq-mcp
- Contact: hello@powergridiq.com

## Suggested categories

Energy, finance, data, developer tools. Avoid categories that imply advice, brokerage, or a certified recommendation.

## Client configuration examples (for listings that ask)

Stdio (npm), optional key:

```json
{
  "mcpServers": {
    "powergridiq": {
      "command": "npx",
      "args": ["-y", "pgiq-mcp"],
      "env": { "PGIQ_KEY": "pk_live_optional_key" }
    }
  }
}
```

Hosted (streamable HTTP), no key required:

```json
{
  "mcpServers": {
    "powergridiq": {
      "url": "https://powergridiq.com/mcp"
    }
  }
}
```

If the client supports headers and a Desk or volume key is used, send `Authorization: Bearer <key>`.
