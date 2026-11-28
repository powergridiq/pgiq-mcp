# Official MCP Registry

Registry: https://registry.modelcontextprotocol.io  
Docs: https://modelcontextprotocol.io/registry/quickstart and https://modelcontextprotocol.io/registry/remote-servers  
Schema used: https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json

**Do not run `mcp-publisher publish` or `PUT` this draft until Paul types a separate approval.**

## Current public entry (read-only, 28 November 2026)

`GET https://registry.modelcontextprotocol.io/v0.1/servers/io.github.powergridiq%2Fpgiq-mcp/versions`

| Version | isLatest | Published (UTC) | Description | Packages | Remotes |
| --- | --- | --- | --- | --- | --- |
| 1.3.0 | yes | 2026-10-05 01:01:17 | "Power-market ratings, delivered cost, claims and gaps for siting a large electricity load." | npm `pgiq-mcp` 1.3.0, stdio, optional `PGIQ_KEY` and `PGIQ_API` | none |
| 1.1.0 | no | 2026-07-01 17:07:04 | "PGIQ Rating as agent tools for siting large electricity loads across 67 power markets." | npm `pgiq-mcp` 1.1.0, stdio, optional `PGIQ_KEY` | none |

Both versions are `status: active`. Namespace and latest version already match the published npm package. The hosted endpoint is not listed.

The 1.1.0 description is inaccurate (typed market count; see [current-inaccuracies.md](current-inaccuracies.md)). This draft does not change 1.1.0. Deprecating or deleting it would need Paul's approval at submit time.

## What the draft changes

File: [official-server.json](official-server.json)

Keeps `name` `io.github.powergridiq/pgiq-mcp` and `version` `1.3.0`. Adds:

- `title`: PowerGridIQ
- `websiteUrl`: https://powergridiq.com/build
- `remotes`: one `streamable-http` URL, `https://powergridiq.com/mcp`, with an optional secret `Authorization` header for a Desk or volume key
- Slightly clearer `PGIQ_KEY` description (still optional, not required)

The npm `packages` entry stays at 1.3.0, so no npm publish is required if this is applied as an edit of the existing 1.3.0 record.

## Validation (no publish)

On 28 November 2026, 12:08 PM EST:

```text
POST https://registry.modelcontextprotocol.io/v0.1/validate  →  {"valid":true,"issues":[]}
POST https://registry.modelcontextprotocol.io/v0/validate    →  {"valid":true,"issues":[]}
```

Receipt: `captures/official-server-validate.json`. The live hosted endpoint accepted `initialize` and `tools/list` over `POST` and is publicly reachable, which the registry requires for a remote.

## Submission method (after Paul approves)

1. Confirm the pre-submit decision in [README.md](README.md): one registry entry for both the stdio package and the hosted tool surface is acceptable.
2. Copy `docs/registry/official-server.json` over the repo's root `server.json` (they are deliberately not identical today).
3. Install the official `mcp-publisher` CLI if needed, following https://modelcontextprotocol.io/registry/quickstart.
4. **Paul (or someone he names who can act as the `powergridiq` GitHub org) runs** `mcp-publisher login github` and completes the GitHub OAuth screen. The registry checks control of the `io.github.powergridiq` namespace this way. It does not verify control of `powergridiq.com`.
5. Prefer **editing** the existing 1.3.0 record so the version stays aligned with npm:
   - Authenticated `PUT /v0.1/servers/io.github.powergridiq%2Fpgiq-mcp/versions/1.3.0` with the draft body, or
   - `mcp-publisher publish` only if the CLI is confirmed to update 1.3.0 rather than reject a duplicate version.
6. If the registry refuses to edit 1.3.0, stop and ask Paul whether to publish a new server version (for example 1.3.1) with the same npm package version 1.3.0. Do not npm-publish a new package version unless Paul approves that too.
7. Verify with:

```bash
curl "https://registry.modelcontextprotocol.io/v0.1/servers/io.github.powergridiq%2Fpgiq-mcp/versions/1.3.0"
```

The latest entry should then include `remotes[0].url` `https://powergridiq.com/mcp` and still show npm package 1.3.0.

Do not change the status of 1.1.0 unless Paul asks.

## Steps that need Paul

- Typed approval to submit (this PR is not that approval).
- GitHub login as a `powergridiq` org member on the `mcp-publisher login github` prompt.
- The publish or PUT command itself.
- A decision if 1.3.0 cannot be edited in place, and a decision on the stale 1.1.0 entry.
- Optional later decision: whether to also publish under a DNS/HTTP namespace such as `com.powergridiq/...` so the server name matches the hosted domain. Not required to add `remotes` to the existing name.
