# Base64 file uploads through the MCP server

**Date:** 2026-08-12
**Branch:** `feat/file-uploads`

## Problem

Callers of the hosted MCP server need to upload files into AccuLynx by sending
the bytes themselves — "as a file or base64". Today a file input may be a local
path (CLI only), an https URL, or a `data:` URI. Two things break the base64
path in practice:

1. **Raw base64 is silently dropped.** A bare base64 string (no `data:` prefix)
   falls through `resolveSandboxFile` as a "nonexistent local path" and is
   passed verbatim to the SDK, which stats it, gets ENOENT, and drops the file
   parameter entirely. The API call then fails with a confusing error — or
   worse, succeeds without the file.
2. **No way to name the file.** `decodeDataUri` rejects data URIs carrying
   parameters (`data:application/pdf;name=contract.pdf;base64,…` fails the
   regex as "malformed"), and files decoded from unnamed data URIs land as
   `upload.bin`. AccuLynx's ingest keys off the filename/extension, and
   `@readme/api-core` itself uses the `;name=` convention — so the one standard
   way to attach a filename is exactly the input we reject.

## Approaches considered

- **A. Structured file objects** (`{"base64": "...", "fileName": "x.pdf"}`
  accepted wherever a file string is): most explicit, but changes every file
  field from `z.string()` to a union, which ripples through the flag
  introspection (`schema-to-flags`), `acculynx_describe` output, and the CLI
  flag surface. High blast radius for what a data-URI parameter already
  expresses.
- **B. Sibling `fileName` inputs per command**: leaves schemas as strings but
  needs per-command wiring in four commands plus the recursive
  `resolveSandboxFiles` traversal, and the pairing is implicit.
- **C. Extend the string grammar (chosen)**: accept raw base64 as a fourth
  string form, and fix `decodeDataUri` to parse RFC-2397 parameters including
  `;name=`. No schema shape changes, no CLI surface changes, works uniformly
  everywhere `resolveSandboxFile` is already called (documents, photos/videos,
  measurements ×2).

## Design (approach C)

`resolveSandboxFile` resolution order for a string input:

1. `https://` (or `http://` with override) → download to temp (existing).
2. `data:` → decode to temp (existing, upgraded):
   - Parse parameters: `data:<mime>(;name=<filename>)?(;charset=…)?(;base64)?,<payload>`.
   - `;name=` (URI-decoded, basename-sanitized) wins as the filename.
   - Else mime-mapped extension; else magic-byte sniff; else `.bin`.
3. **Raw base64 (new):** string matches the base64 charset (`A–Za–z0–9+/=`
   plus whitespace), is ≥ 256 chars, has length ≡ 0 (mod 4) after whitespace
   removal, and decodes to non-empty bytes → write to temp as
   `upload<ext>` where `<ext>` comes from magic-byte sniffing
   (PNG/JPEG/GIF/WEBP/PDF/MP4/MOV/HEIC/ZIP). Undetectable content still
   uploads as `.bin`.
4. Existing local path → pass through (existing).
5. Anything else → `null` (caller passes the raw string to the SDK, as today).

The 256-char floor plus charset check makes collision with a real path
practically impossible: filenames virtually always contain a `.`, which is
outside the base64 charset, and any path shorter than 256 chars fails the
floor. A ≥ 256-char dot-free path made entirely of base64 characters is
degenerate enough that treating it as base64 is the right call.

Ordering note: raw-base64 detection runs **before** the local-path check so a
huge base64 string is never handed to `fs.access`, but after URL/data-URI
prefixes which are unambiguous.

Size limit: the existing 25 MB `MAX_REMOTE_FILE_BYTES` cap applies to decoded
raw base64 too. Vercel's request-body cap (~4.5 MB) bounds hosted-MCP inline
uploads at roughly a 3 MB file; larger files must come in by https URL. This
is documented, not worked around.

`preferFileUriForUrls` is untouched: raw base64 and data URIs go multipart;
URLs keep routing through AccuLynx's `fileUri` fetch.

Field descriptions in the four upload commands are updated to name all four
accepted forms, including `;name=` for controlling the stored filename.
docs/mcp.md gains an "Uploading files" section covering forms and size limits.

## Components touched

| File | Change |
| --- | --- |
| `src/lib/acculynx.ts` | `decodeDataUri` parameter/name parsing; `sniffExtension`; raw-base64 branch in `resolveSandboxFile` |
| `src/commands/acculynx_add_job_document.ts` | description text |
| `src/commands/acculynx_post_upload_photo_or_video.ts` | description text |
| `src/commands/acculynx_post_job_measurements_upload.ts` | description text |
| `src/commands/acculynx_post_job_measurements_upload_files.ts` | description text |
| `test/file-input.test.ts` | new cases (below) |
| `docs/mcp.md` | "Uploading files" section |

## Error handling

- Base64-looking input that fails to decode or decodes to zero bytes → clear
  error, not silent passthrough.
- Decoded payload over 25 MB → existing "too large" error.
- `;name=` values are sanitized with `path.basename` after URI-decoding so a
  crafted name cannot escape the temp directory.

## Testing

Unit (extends `test/file-input.test.ts`):
- raw base64 of a PNG → temp file with `.png` (sniffed), bytes match, cleanup removes it
- raw base64 of a PDF → `.pdf` via sniffing
- raw base64 of unknown bytes → `.bin`, still resolves
- short base64-charset string ("hello") → null (path fallthrough preserved)
- data URI with `;name=contract.pdf` → filename `contract.pdf`
- data URI `;name=` beats mime extension; URI-encoded and path-traversal names sanitized
- non-base64 data URI with name parameter still decodes
- oversized raw base64 rejected

Existing 66 tests must stay green. Manual verification: upload a real photo
via base64 through `npm run test:mcp` flow is out of scope for sandbox (no
egress); rely on unit coverage plus the unchanged SDK path already proven for
data URIs.
