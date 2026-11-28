# Inaccuracies in current public listings

Checked 28 November 2026. These are already live. This pull request does not change them. Fixing them needs Paul's typed approval to submit or edit each listing.

## Official MCP Registry

- **Version 1.1.0 is still `active`** at `io.github.powergridiq/pgiq-mcp`, published 1 July 2026, `isLatest: false`. Its description is "PGIQ Rating as agent tools for siting large electricity loads across **67 power markets**." That typed count is out of date (the work plan's QA check 29 says the description must not contain "67"). The live `list_markets` count on this date was 79, and the site footer also uses other counts for different views. The 1.3.0 description correctly avoids a count.
- **Version 1.3.0 (latest) has no `remotes` entry.** The hosted server at https://powergridiq.com/mcp is live (18 tools) but undiscoverable from the official record.
- The 1.3.0 record also has no `title` or `websiteUrl`. Minor, not inaccurate.

## npm `pgiq-mcp` 1.3.0

- The published package and this repo's `main` README are consistent with each other (11 `pgiq_*` tools, `pgiq_cheapest_window` removed, no "67").
- The README still describes only the stdio install. It does not mention the hosted endpoint. That is a gap, not a false statement.
- `/legal` states the free cap as 100 requests per **UTC** day per IP. The README says "100 requests/day per IP" without "UTC". Small precision gap.

## Glama — https://glama.ai/mcp/servers/powergridiq/pgiq-mcp

This is the most inaccurate public listing. It still shows a 1.1.0-era README and a 4 July 2026 inspection of 6 tools, despite `main` being 1.3.0 since 23 November 2026.

- "covering **67** global power markets" in the body.
- Meta description and JSON-LD: "**70+** global power markets" and "**cheapest-window scheduling**".
- Still lists **`pgiq_cheapest_window`**, removed in 1.3.0, including as a scored tool ("cheapest hours to run a flexible load", "Omit market for the cheapest grids ranked").
- Only **6 tools** scored (TDQS 4.2/5 on 4 July 2026). Missing `pgiq_claims`, `pgiq_gaps`, `pgiq_actions`, `pgiq_screen`, `pgiq_price_index`, `pgiq_cost_history`.
- `pgiq_best` described as "the ranked **best-market decision**" and "This is the **decision endpoint**." The current README calls it a ranked shortlist. A rank is not a certification.
- `pgiq_grid` described as "Merges **live signals** where available" and "**firm headroom**." Current README: modelled wholesale baseline; system-level firm margin, not local connectable capacity.
- README excerpt: "A hosted remote MCP server (no local install) **is planned**; for now this runs locally via stdio." The hosted server is already live.
- "Live grid signals, rating-change webhooks, and metered keys are available now; short-horizon forecasts are next." Forecast claim aside, this block sits next to the outdated tool list and should be re-checked when the listing is edited.
- Install example uses a local absolute path, not `npx -y pgiq-mcp`.

## PulseMCP — https://www.pulsemcp.com/servers/pgiq

- Description and meta description: "Electricity load siting analysis for AI agents across **US power markets**." PowerGridIQ is not US-only.
- "Released On **Jul 1, 2026**" is the 1.1.0 registry date, not 1.3.0 (5 October 2026).
- No hosted endpoint, which currently matches the official record and will be stale after `remotes` is published.
- Submissions and edits are paused (submit page last updated 3 September 2026), so this blurb cannot be corrected through their form today.

## Smithery

- No listing found, so no inaccurate public text to correct.
- After 31 October 2026 there is no public self-serve submit path on the pages checked.

## mcp.so

- No listing found (search: 0 results).

## Related, but not a registry listing

These are not directory pages, but they can be copied into listings if someone is careless:

- This GitHub repo's default branch is now 1.3.0 and is fine. The GitHub repo **homepage** field is empty and the short GitHub description does not mention the hosted endpoint.
- `/build` still documents `GET /api/v1/cheapest-window`. That is a site documentation issue, not a registry listing, and is out of scope for this PR.
