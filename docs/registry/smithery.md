# Smithery

Site: https://www.smithery.ai  
Policy note checked: https://www.smithery.ai/future (shutdown of Smithery accounts, API, CLI and proxied URLs on 31 October 2026)

**Do not submit, sign up, or email Smithery or Arcade until Paul types a separate approval.**

## Current public listing

No PowerGridIQ or `pgiq-mcp` listing was found on 28 November 2026.

Checked:

- https://www.smithery.ai/server/@powergridiq/pgiq-mcp → 404
- https://smithery.ai/servers/pgiq-mcp → 404
- https://www.smithery.ai/servers?q=powergridiq — the directory page loaded, but it did not return a PowerGridIQ card (the query string is not clearly applied on that page)
- https://api.smithery.ai/server/powergridiq/pgiq-mcp → 404

## What changed at Smithery

On 31 October 2026 Smithery shut down its MCP proxy and managed identity. The public page says Smithery remains as a public, non-proxied MCP directory, now powered by Arcade.dev, with a curated set of verified servers that show the vendor's own MCP URL. Smithery accounts, API keys, the Smithery CLI and SDKs are stopped.

There is no working self-serve "add server" form or CLI path in that announcement. The only contact on that page is a personal address for the cofounder, which this work must not use.

## Draft listing (for when a path exists)

Use the shared copy in [shared-copy.md](shared-copy.md).

- Name: PowerGridIQ
- Short description: the 89-character official description
- Long description: the shared longer description, including the stdio / hosted tool-name difference
- Remote URL: `https://powergridiq.com/mcp` (streamable HTTP). Do not invent a `server.smithery.ai` or `run.tools` URL.
- Install: `npx -y pgiq-mcp` for stdio; hosted URL for remote
- Auth and limits: no key; 100 requests per UTC day per IP; optional keys as in the shared copy; free keys "coming", not available
- Categories: Energy / finance / data
- Privacy: the shared privacy note
- Official registry name, once published with remotes: `io.github.powergridiq/pgiq-mcp`

## Submission method (after Paul approves)

1. Recheck https://www.smithery.ai and https://www.smithery.ai/future for a new public submit or official-registry ingest path. Requirements may have changed.
2. If Smithery now ingests the official MCP Registry, publishing the official `remotes` entry may be enough. Confirm a listing appeared before doing anything else.
3. If the only remaining path is a human contact, **Paul** would make that contact himself. This draft does not send mail and does not recommend a paid Arcade product.
4. If a form or allowlist exists by then, paste the shared copy, the hosted URL, and the GitHub / npm links. Do not create a Smithery account unless Paul has approved that sign-up.

## Steps that need Paul

- Typed approval to submit, if a path exists.
- Any new Smithery or Arcade account.
- Any email or form sent in PowerGridIQ's name.
