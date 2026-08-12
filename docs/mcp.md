# MCP server

The same command registry that powers the CLI, exposed over MCP so AccuLynx is
reachable from Cowork cloud sessions, the desktop app, and mobile.

## Why this exists

Cowork's cloud sandbox routes all shell traffic through an egress proxy that
only allows package registries. `api.acculynx.com` is not on that allowlist, so
the bundled CLI fails there with a bare `Forbidden` no matter how credentials
are supplied — including the hardcoded-key escape hatch in
`scripts/sync-plugin.sh`. MCP connector traffic does not traverse that proxy, so
a hosted MCP server works where the CLI cannot.

## Design

Three meta-tools cover all 120 commands instead of one tool per command, which
would load 120 schemas into context on every session:

| Tool | Purpose |
| --- | --- |
| `acculynx_search` | Find a command by keyword. Omit the query to list everything. |
| `acculynx_describe` | Full JSON Schema + runnable example for one command. |
| `acculynx_run` | Execute a command with arguments as a JSON object. |

The server reuses `src/registry.ts`, `src/lib/run-command.ts`, and every file in
`src/commands/` unchanged — the same validation, projection, pagination hints,
and error shapes as the CLI. `src/describe.ts` was refactored so `describeCommand`
and `searchCommands` return structured values that both transports share; the
CLI's `runDescribe` / `runSearch` are thin printing wrappers over them.

The operational primer from `src/guide.ts` ships as the MCP `instructions`
payload, with a short appendix translating CLI flag syntax into `input` objects.

## Layout

```
src/mcp/server.ts       McpServer + the three meta-tools
src/mcp/http-entry.ts   Stateless Streamable HTTP handler + bearer auth
scripts/build-mcp.mjs   esbuild → Vercel Build Output API v3
test/mcp-local.mjs      End-to-end smoke test over real MCP
```

Every module in `src/` imports with explicit `.ts` specifiers, which only
resolves under a bundler. So the function is bundled with esbuild and emitted as
a prebuilt Build Output API function rather than left for Vercel to compile —
the deploy shape is explicit and does not depend on framework detection.

## Environment

| Variable | Required | Purpose |
| --- | --- | --- |
| `ACCULYNX_API_KEY` | yes | AccuLynx v2 API key. Never leaves the server. |
| `MCP_AUTH_TOKEN` | yes | Bearer token clients must present. **Fails closed** — unset means every request is rejected. |
| `ACCULYNX_SIGNER_EMAIL` | no | Signature resolution for report commands. |
| `ACCULYNX_TIMEOUT_MS` | no | Per-request timeout. |
| `ACCULYNX_RETRY_ATTEMPTS` | no | Transient-failure retries (default 3). |

## Deploy

```bash
npm run build:mcp          # → .vercel/output
vercel deploy --prebuilt   # or let a git-connected project run buildCommand
```

`vercel.json` sets `buildCommand` to `npm run build:mcp`, so a git-connected
project redeploys on push with no extra configuration.

Connect it as a custom MCP connector at the deployment URL, with header
`Authorization: Bearer <MCP_AUTH_TOKEN>`.

## Testing

```bash
npm run test:mcp
```

Boots the bundled handler behind a local HTTP server and drives a real MCP
session: auth rejection, handshake, tool listing, search, describe, argument
validation, and error mapping. The final case asserts that `acculynx_run`
reaches the AccuLynx network boundary and passes in any environment: with
real egress the ping succeeds, and in an egress-blocked sandbox the
network/auth-shaped error counts too. Only local validation or routing
errors fail it.

## Uploading files

### Direct upload (preferred)

File bytes should not travel through model context — base64 costs ~1 token per
character in each direction. `acculynx_request_upload` (registered when
`SIGNING_SECRET` is set) mints a single-use PUT URL bound to jobId +
documentFolderId + fileName via an HMAC-signed ticket (10-minute expiry,
4 MB cap — under Vercel's ~4.5 MB body limit). The caller PUTs the raw bytes:

```bash
curl -sS -X PUT -H "Content-Type: application/octet-stream" --data-binary @file.pdf "<uploadUrl>"
```

`PUT /api/uploads/<ticket>` verifies the HMAC, enforces size, forwards the
body to AccuLynx as the same multipart call as `documents add`, and returns a
receipt `{ ok, fileName, jobId, documentFolderId, bytes, sha256,
acculynxStatus, uploadedAt }` — the sha256 is the only integrity check
available since AccuLynx has no read-back API. Receipts are also logged
server-side for later duplicate identification by hash.

Status semantics: **200** receipt · **403** invalid ticket · **410** expired ·
**413** oversize · **409** ticket already used — *do not retry*, the first
upload likely landed and cannot be deleted · **502** AccuLynx rejected the
forward — the ticket is released, one retry is safe.

The PUT is unauthenticated by design (a sandboxed caller holds no
credentials); the signed ticket fixes every destination field at mint time so
a leaked URL can only re-send bytes, never retarget them. Single-use is
enforced per warm instance — the deployment persists nothing, so a replay
against a cold instance inside the TTL is not blocked; the short TTL bounds
that window.

This exists because Cowork's sandbox can reach the connector's own host but
not third-party storage (probed: `acculynx-cli.vercel.app` 200,
`*.supabase.co` and `s3.amazonaws.com` 403 CONNECT denied), so the PUT is
served from the host that is already allowlisted.

### Inline content (fallback)

File-bearing inputs (`documents add`, `photos upload`, the two measurements
uploads) also accept the file content itself in any of these string forms:

| Form | Example | Notes |
| --- | --- | --- |
| https URL | `https://example.com/roof.jpg` | Downloaded server-side (photos/videos: handed to AccuLynx as `fileUri` instead). 25 MB max. |
| data: URI | `data:application/pdf;name=contract.pdf;base64,JVBER…` | `;name=<filename>` sets the filename stored in AccuLynx; otherwise it is derived from the mime type or content. |
| bare base64 | `JVBERi0xLjQK…` | Detected when the string is ≥ 256 chars of pure base64. File type is sniffed from magic bytes (PNG/JPEG/GIF/WEBP/PDF/MP4/MOV/HEIC/ZIP). |
| local path | `proposal.pdf` | CLI only — meaningless through the hosted server. |

`documents add` and `photos upload` also take an explicit `fileName` input
that overrides any derived name for every form — the easiest way to store
"McPherson Supplement 1.pdf" instead of a generated name. An input that
matches none of the forms (e.g. a path that does not exist server-side) now
fails fast with an error naming the accepted forms, instead of the SDK
silently dropping the file and AccuLynx replying "Filename is required".

Inline payloads are capped at 25 MB decoded, but Vercel rejects request
bodies over ~4.5 MB, so through the hosted server an inline upload tops out
around a 3 MB file — send anything larger by https URL.

Document ingest is asynchronous: the AccuLynx API returns 202 Accepted with
no body and offers no list/get/delete for job documents, so uploads cannot be
confirmed or undone via API — only in the AccuLynx UI.

## Known gaps

`reports coc` and `reports roof-report` render PDFs to local disk. Serverless has
no durable filesystem and no way to return a file through the MCP channel, so
`acculynx_run` refuses them with a pointer to the CLI. The planned fix is to move
both templates from `pdf-lib` draw calls to server-rendered HTML: the server
returns populated HTML from a fixed template and the client converts it to PDF,
which keeps layout deterministic while removing PDF rendering from the function.
That also retires roughly 280 lines of hand-rolled pagination in
`src/lib/pdf.ts`.
