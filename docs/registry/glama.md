# Glama

Existing listing: https://glama.ai/mcp/servers/powergridiq/pgiq-mcp  
FAQ: https://glama.ai/mcp/faq  
`glama.json` is already in the root of this repository (`maintainers`: `powergridiq`).

**Do not click Add / Claim / Deploy, and do not sign in to Glama, until Paul types a separate approval.**

## Current public listing (28 November 2026)

The listing exists, is marked Official, and is categorized under Energy and Finance. It is **stale**. It still reflects the July 2026 / 1.1.0-era README and a 4 July 2026 inspection of **6 tools**, even though this repo's `main` has been 1.3.0 since 23 November 2026 (merge of PR #1).

Notable inaccuracies (full list in [current-inaccuracies.md](current-inaccuracies.md)):

- Body text still says "covering 67 global power markets".
- The page JSON-LD / meta description says "70+ global power markets" and "cheapest-window scheduling".
- Tools still include `pgiq_cheapest_window`, which was removed in 1.3.0.
- Only six tools are listed. Missing from the inspection: `pgiq_claims`, `pgiq_gaps`, `pgiq_actions`, `pgiq_screen`, `pgiq_price_index`, `pgiq_cost_history`.
- Wording such as "the ranked best-market decision" and "This is the decision endpoint" overclaims what `pgiq_best` does.
- `pgiq_grid` is described as merging "live signals" and "firm headroom". The current README says a modelled wholesale baseline and system-level firm margin, not local connectable capacity.
- The README excerpt still says "A hosted remote MCP server (no local install) is planned; for now this runs locally via stdio." The hosted endpoint is already live.
- Install example uses a local `node /absolute/path/to/pgiq-mcp/index.js` rather than `npx -y pgiq-mcp`.

The listing appears to be the stdio package only. There is no hosted connector URL for `https://powergridiq.com/mcp`.

## Draft listing

Use the shared copy in [shared-copy.md](shared-copy.md).

- Display name: PowerGridIQ
- Short description: the 89-character official description (replace both the "67" body text and the "70+" meta description)
- Long description / README: once `main` is what Glama re-indexes, the current root README is the right stdio text. Also add the hosted URL and the tool-name difference from the shared copy, either in a follow-up README sentence after Paul approves a README change, or in Glama's listing fields after claiming.
- Categories: keep Energy; Finance is acceptable if it does not imply advice. Do not add "scheduling" as a live cheapest-window feature.
- Auth and limits: 100 requests per UTC day per IP, no key; optional keys as in the shared copy; free keys coming, not available.
- Hosted connector (if Glama's "submit a connector" flow is used): URL `https://powergridiq.com/mcp`, streamable HTTP, auth optional (`Authorization: Bearer <key>`), no secret required to list tools.
- Maintainers: keep `glama.json` as `["powergridiq"]`.

Do not use Glama "Deploy Server" / third-party hosting ads as part of the official listing.

## Submission method (after Paul approves)

For the existing **open-source server** listing (stdio package):

1. A maintainer with write or admin access to `powergridiq/pgiq-mcp` signs in to Glama with GitHub (required by Glama to add or claim).
2. If the listing is unclaimed, use Claim and prove maintainership via GitHub and the existing `glama.json`.
3. Trigger a sync / rebuild so Glama re-indexes `main` at `64c42100` or later (the 1.3.0 README, 11 tools, no `pgiq_cheapest_window`, no "67").
4. Under Admin → Listing, set the display name and short description from the shared copy, and remove leftover "70+" / cheapest-window marketing text if the sync does not.
5. Confirm the public page shows 11 stdio tools and the corrected description.

For the **hosted endpoint**, Glama's FAQ says a hosted server can be submitted as a connector, with the endpoint, and does not require a repository. That is a second, optional listing. If Paul wants it:

1. Submit the connector with URL `https://powergridiq.com/mcp`.
2. After claiming, decide whether official-registry metadata should remain the source of truth (Glama's default when a connector is linked to the official registry) or whether Glama listing details should be locked. Prefer the official registry once `remotes` has been published, so the two do not drift.

## Steps that need Paul

- Typed approval to claim, resync, edit, or add a connector.
- GitHub sign-in to Glama as a `powergridiq` org member with write access to this repo.
- A decision on whether to add a separate hosted connector or wait until the official registry `remotes` entry exists and is ingested.
