# PulseMCP

Existing listing: https://www.pulsemcp.com/servers/pgiq  
Submit page: https://www.pulsemcp.com/submit

**Do not submit a new listing or request an edit until Paul types a separate approval, and not while PulseMCP is still paused.**

## Current public listing (28 November 2026)

PulseMCP already lists the official registry package:

- Title: Official PGIQ Rating MCP Server
- Display name: PGIQ Rating
- Provider: PowerGridIQ
- Classification: official
- Description / meta description: "Electricity load siting analysis for AI agents across US power markets."
- Released on: 1 July 2026 (the 1.1.0 registry publish date, not 1.3.0)
- GitHub repo linked; "server.json file available"
- Registry name shown: `io.github.powergridiq/pgiq-mcp`
- Maintainer shown: GitHub organization `powergridiq`

Inaccuracies:

- **"US power markets" is wrong.** PowerGridIQ rates markets in several regions, not only the US. Ireland, for example, is a European market on the live site.
- **Release date 1 July 2026** describes 1.1.0, not the latest 1.3.0 (5 October 2026).
- No hosted endpoint is mentioned, which matches the current official `server.json` (stdio only). That becomes stale once `remotes` is published.

Search on https://www.pulsemcp.com/servers?q=PowerGridIQ returned this single result.

## Submit page status

https://www.pulsemcp.com/submit (checked 28 November 2026) says submissions and changes are temporarily paused, last updated 3 September 2026. No reopen date is given. The page tells publishers to use the official MCP Registry, "the best first step even when we are not paused", and says PulseMCP will pick that up automatically once it is back.

So the practical order is: publish the official `remotes` update first, then wait. A blurb correction for "US power markets" cannot be sent through their form while the pause lasts.

## Draft listing (for when edits reopen, or for the automatic ingest)

- Name: PowerGridIQ (preferred) or keep "PGIQ Rating" if PulseMCP requires a short product name
- Short description: the 89-character official description (this replaces the US-only blurb)
- Long description, tools, auth, limits, privacy, links: [shared-copy.md](shared-copy.md)
- Registry name: `io.github.powergridiq/pgiq-mcp` version 1.3.0
- Remote URL: `https://powergridiq.com/mcp`
- GitHub: https://github.com/powergridiq/pgiq-mcp

## Submission method (after Paul approves)

1. Recheck https://www.pulsemcp.com/submit.
2. If still paused: do not send a form. Publish the official registry edit, then recheck this PulseMCP page after reopen to see whether `remotes` and the official 1.3.0 description appeared automatically, and whether the US-only blurb was replaced.
3. If submissions have reopened and the automatic ingest did not fix the blurb, **Paul** uses their form (or the reopen instructions) to request an edit of https://www.pulsemcp.com/servers/pgiq. Paste the shared short description and the hosted URL.
4. Do not open a second PulseMCP listing for the same server.

## Steps that need Paul

- Typed approval, once a path exists.
- Any PulseMCP account or form submit.
- A check, after official publish and after PulseMCP reopens, that the US-only sentence is gone.
