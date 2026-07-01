# PowerGridIQ MCP server

Exposes the **PGIQ Rating** as tools any MCP-capable agent (Claude Desktop, Claude Code, Cursor,
custom agents) can call: "where should I site or schedule a large electricity load, and how is a
given market rated." It wraps the read-only REST API at `https://powergridiq.com/api/v1`, covering
67 global power markets with a reasoned, cited decision, not just raw feeds.

## Tools
- `pgiq_markets` - list every rated market (id, tier, score, outlook). Start here.
- `pgiq_rating(market)` - full five-pillar rating + evidence for one market (e.g. `quebec`).
- `pgiq_best(lens?, group?, min_tier?, limit?)` - the ranked best-market decision. `lens` is
  `default|cost|carbon|momentum`.
- `pgiq_developments(market?)` - recent cited grid developments.
- `pgiq_grid(market)` - grid snapshot: carbon intensity, price, fuel mix, demand, firm headroom,
  peak stress. Merges live signals where available, else a clearly labelled modelled baseline.
- `pgiq_cheapest_window(market?)` - cheapest hours to run a flexible load (modelled daily price
  shape, local time). Omit `market` for the cheapest grids ranked.

## Install & run
```bash
cd pgiq-mcp
npm install
node index.js   # speaks MCP over stdio
```

## Configure in Claude Desktop
Add to `claude_desktop_config.json` (Settings → Developer → Edit Config):
```json
{
  "mcpServers": {
    "powergridiq": {
      "command": "node",
      "args": ["/absolute/path/to/pgiq-mcp/index.js"],
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

## Notes
- The rating is a directional screen, not a connection guarantee; the interconnection queue is the
  real gate. Every market carries a confidence level, treat lower confidence with more caution.
- Live grid signals, rating-change webhooks, and metered keys are available now; short-horizon
  forecasts are next.
- A hosted remote MCP server (no local install) is planned; for now this runs locally via stdio.

## Links
- API spec: https://powergridiq.com/openapi.json
- Agent map: https://powergridiq.com/llms.txt
- Developer page: https://powergridiq.com/build
