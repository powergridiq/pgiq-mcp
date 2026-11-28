# MCP registry listing drafts (Task 61)

**Status: DRAFT ONLY. Do not submit, publish, or merge this pull request until Paul gives separate typed approval.**

This folder prepares ready-to-submit listings for PowerGridIQ's MCP interfaces. Nothing in this pull request submits a listing, runs `mcp-publisher publish`, or publishes to npm.

Authorized by Paul's typed policy approval **t109u** (28 November 2026, 11:25 AM EST) as relayed by Task Manager: draft the MCP registry listings, and stop before any submission.

## What is being listed

Two ways to call PowerGridIQ, which share a dataset but are **not the same MCP tool surface**:

| Interface | Where | Transport | Version seen live / published | Tool names |
| --- | --- | --- | --- | --- |
| npm package `pgiq-mcp` | [npmjs.com/package/pgiq-mcp](https://www.npmjs.com/package/pgiq-mcp) | stdio | **1.3.0**, published 5 October 2026 | `pgiq_*` (11 tools; `pgiq_cheapest_window` removed in 1.3.0) |
| Hosted server | https://powergridiq.com/mcp | streamable HTTP (JSON-RPC `POST`; `GET` returns 405; no SSE stream, no sessions) | `serverInfo.version` **0.2.0**, title "PowerGridIQ (hosted MCP, partial)" | 18 unprefixed tools (see below). `connection_wait` is not available yet. |

The official registry name is already `io.github.powergridiq/pgiq-mcp`. The draft `server.json` keeps that name and version **1.3.0**, and adds a `remotes` entry for the hosted endpoint.

**Pre-submit decision for Paul:** clients that switch from the npm package to the hosted URL will see different tool names and a different tool set. Confirm that sharing one registry entry is acceptable, or wait until the tool names are aligned, before anyone publishes.

## Directories covered

Task 61 in the work plan asks for the official MCP registry entry plus "2–3 MCP directories" and a short demo transcript, and to stop and ask before submitting. This draft covers the official registry and the four directories named in the Task 61 assignment:

1. Official MCP Registry (`registry.modelcontextprotocol.io`)
2. Smithery
3. Glama
4. mcp.so
5. PulseMCP

## Files

| File | Purpose |
| --- | --- |
| [shared-copy.md](shared-copy.md) | Shared name, descriptions, tool lists, auth, limits, free/Desk boundary, privacy, links, categories |
| [official-server.json](official-server.json) | Draft `server.json` (validated, not published) |
| [official.md](official.md) | Official registry notes and submit steps |
| [smithery.md](smithery.md) | Smithery draft and submit path |
| [glama.md](glama.md) | Glama draft and submit / resync path |
| [mcp-so.md](mcp-so.md) | mcp.so draft and form fields |
| [pulsemcp.md](pulsemcp.md) | PulseMCP draft and current pause |
| [demo-transcript.md](demo-transcript.md) | One live question, answered with citations |
| [current-inaccuracies.md](current-inaccuracies.md) | Problems in listings that are already public |
| [captures/](captures/) | Read-only live captures from 28 November 2026 |

## What Paul still has to do

No submission happens until Paul types a separate approval. After that, the remaining steps that need Paul (accounts, login, or a paid choice) are listed per directory in the files above. In short:

- Official registry: a `powergridiq` GitHub org login for `mcp-publisher`, then either an edit of version 1.3.0 or a new version if the edit is refused. Copy this draft over the repo's root `server.json` at submit time. No npm publish is required if version 1.3.0 is only edited to add `remotes`.
- Glama: a GitHub login with write access to this repo, then add or resync the existing listing (already stale).
- mcp.so: sign-in may be required; Paul submits the form and chooses free review or the paid $39 option. This draft does not recommend paying.
- PulseMCP: submissions and edits are paused (page last updated 3 September 2026). Publish the official entry first; PulseMCP says it will pick that up when it reopens. The existing PulseMCP page also needs its blurb corrected when edits reopen.
- Smithery: no public self-serve submit path was found after the 31 October 2026 shutdown of Smithery accounts, API and CLI. Paul would need a later official path, or to contact Smithery/Arcade himself. Nobody from this work should email them.

## Live checks (28 November 2026, afternoon EST)

- `POST https://powergridiq.com/mcp` `initialize` and `tools/list`: 18 tools. Raw bodies in `captures/`.
- Official registry `GET /v0.1/servers/io.github.powergridiq%2Fpgiq-mcp/versions`: 1.3.0 is latest (stdio only, no `remotes`); 1.1.0 remains active and still says "67 power markets".
- npm `pgiq-mcp` latest is 1.3.0 (published 5 October 2026, 01:00:57 UTC).
- Official `POST /v0.1/validate` and `/v0/validate` of `official-server.json`: `{"valid":true,"issues":[]}`. Nothing was published.
