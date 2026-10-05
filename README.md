# PowerGridIQ MCP server

Exposes the **PGIQ Rating** as tools any MCP-capable agent (Claude Desktop, Claude Code, Cursor,
custom agents) can call: "where should I site or schedule a large electricity load, and how is a
given market rated." It wraps the read-only REST API at `https://powergridiq.com/api/v1`, covering
the rated power markets listed by `pgiq_markets`, with a reasoned, cited decision rather than raw feeds.

Cost figures are for the standard case: a 100 MW load at 95% load factor on high-voltage
(transmission-level) service, in US dollars per MWh, delivered (not wholesale).

## Tools
- `pgiq_markets` - list every rated market (id, tier, score, outlook). Start here.
- `pgiq_rating(market)` - full rating and evidence for one market (e.g. `ontario`), including delivered cost.
- `pgiq_best(lens?, group?, min_tier?, limit?)` - a ranked shortlist. `lens` is `default|cost|carbon|momentum`.
- `pgiq_screen(max_cost?, max_months?, target_cod?, min_tier?, min_carbon?, group?, ...)` - a verdict
  for every market against hard limits: qualifies, rejected (with reason), or insufficient evidence.
- `pgiq_claims(market)` - the sourced claims behind a rating, with sources (and a citation string on newer API responses).
- `pgiq_gaps(market)` - what PowerGridIQ does not hold for a market. A gap is not evidence a risk is absent.
- `pgiq_actions(market?)` - rating actions (new, affirmed, upgrade, downgrade, outlook change).
- `pgiq_developments(market?)` - dated, cited grid developments.
- `pgiq_grid(market)` - grid snapshot: carbon intensity, modelled wholesale baseline, fuel mix, demand,
  system-level firm margin (not local connectable capacity), peak stress.
- `pgiq_price_index(include_series?)` - the European Day-Ahead Power Price Index (wholesale, EUR/MWh).
- `pgiq_cost_history(market)` - what changed in a market's cost record, and whether the market or PowerGridIQ moved.

Removed in 1.3.0: `pgiq_cheapest_window` (an illustrative shape on a modelled baseline, not an observed price series).

Absent values are never zero: newer API responses carry `figures.{field}` with the unit, an ISO
`as_of`, and for a missing value an `absence` kind and reason. Report the absence, not a 0.

## Install & run
```bash
npx -y pgiq-mcp          # from npm
# or from a clone:
npm install && node index.js   # speaks MCP over stdio
```

## Configure in Claude Desktop
Add to `claude_desktop_config.json` (Settings → Developer → Edit Config):
```json
{
  "mcpServers": {
    "powergridiq": {
      "command": "npx",
      "args": ["-y", "pgiq-mcp"],
      "env": { "PGIQ_KEY": "pk_live_optional_key_for_higher_limits" }
    }
  }
}
```
Restart Claude Desktop, then ask things like "Use PowerGridIQ to find the best carbon-light market
for a 100 MW AI cluster in Europe" or "What's the PGIQ rating for Ireland and why?"

## Authentication & limits
- No key needed for the free tier: 100 requests/day per IP.
- For a higher monthly quota, set `PGIQ_KEY=pk_live_...` (developer 25,000/mo, pro 500,000/mo).
  Request a key at hello@powergridiq.com.
- Override the API base with `PGIQ_API` if needed.

## What the server sends
Each request carries `User-Agent: pgiq-mcp/<version>` and `X-PGIQ-MCP-Client: <client name>/<version>`
from the MCP handshake (for example `claude-ai/0.1.0`), so PowerGridIQ can count use by client.
Software names only: nothing about you, your conversation or your machine.

## Notes
- The rating is a directional screen, not a connection guarantee; the interconnection queue is the
  real gate. Every market carries a confidence level; treat lower confidence with more caution.

## Licence
The MCP server code in this repository is MIT licensed (see LICENSE). The licence covers this client
code only. The data it fetches from the PowerGridIQ API is not covered by it and is governed by the
PowerGridIQ terms (https://powergridiq.com/legal).

## Links
- API spec: https://powergridiq.com/openapi.json
- Agent map: https://powergridiq.com/llms.txt
- Developer page: https://powergridiq.com/build
