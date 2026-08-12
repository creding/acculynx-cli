import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { REGISTRY, GROUP_ORDER, findEntry } from "../registry.ts";
import { GUIDE } from "../guide.ts";
import { describeCommand, searchCommands } from "../describe.ts";
import { UsageError, ValidationError } from "../lib/errors.ts";
import { introspect } from "../lib/schema-to-flags.ts";
import { validateInput, postprocess, type GlobalOptions } from "../lib/run-command.ts";
import { getAccuLynxClient, handleApiError } from "../lib/acculynx.ts";
import { requireApiKey } from "../lib/config.ts";
import { CHARACTER_LIMIT } from "../lib/constants.ts";
import { mintUploadTicket, UPLOAD_MAX_BYTES, UPLOAD_TICKET_TTL_S } from "./uploads.ts";

export const MCP_SERVER_VERSION = "0.1.0";

/**
 * Commands that render a PDF to local disk. Serverless has no durable
 * filesystem and no way to hand a file back through the MCP channel, so they
 * are refused here with an explicit pointer rather than failing obscurely
 * after doing the work. See docs/mcp.md — these move to server-rendered HTML
 * templates in a follow-up.
 */
const DISK_WRITING_TOOLS = new Set(["acculynx_generate_coc_pdf", "acculynx_generate_roof_report_pdf"]);

/** `"jobs get"` / `"acculynx jobs get"` / `"jobs.get"` → `["jobs", "get"]`. */
function parseCommand(command: string): { group: string; verb: string } {
  const parts = command.trim().replace(/^acculynx\s+/i, "").split(/[\s.]+/).filter(Boolean);
  if (parts.length !== 2) {
    throw new UsageError(
      `Could not parse command "${command}".`,
      'Use "<group> <verb>", e.g. "jobs get". Run acculynx_search to find one.',
    );
  }
  return { group: parts[0], verb: parts[1] };
}

function ok(payload: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(payload, null, 1) }] };
}

function err(payload: unknown) {
  return { isError: true, content: [{ type: "text" as const, text: JSON.stringify({ error: payload }, null, 1) }] };
}

/** Maps CLI error classes onto MCP tool errors, preserving the CLI's JSON shape. */
function toolError(error: unknown) {
  if (error instanceof ValidationError) {
    return err({
      message: error.message,
      issues: error.issues,
      schema: error.schemaReplay,
      example: error.example,
    });
  }
  if (error instanceof UsageError) {
    return err({ message: error.message, suggestion: error.suggestion });
  }
  return err({ message: handleApiError(error) });
}

export const INSTRUCTIONS = `${GUIDE}

---

## Using this MCP server

Three tools cover the entire ${REGISTRY.length}-command surface:

1. \`acculynx_search\` — find a command by intent (keyword over group, verb, and description).
2. \`acculynx_describe\` — exact input schema + a runnable example. Run this before any command
   you have not already used in this session; do not guess argument names.
3. \`acculynx_run\` — execute it.

Wherever the primer says \`acculynx <group> <verb>\`, pass \`"<group> <verb>"\` as the \`command\`
argument to \`acculynx_describe\` / \`acculynx_run\` and supply arguments as a JSON object in
\`input\` (flags and --json fields alike — there is no flag syntax here).

Groups: ${GROUP_ORDER.join(", ")}.

## Uploading files

This server has no access to your filesystem — a local path in a file input cannot work here.

**Preferred: direct upload (zero bytes through context).** Run the command
\`documents request-upload\` (also exposed as the \`acculynx_request_upload\` tool) with jobId,
documentFolderId, and fileName; it returns a single-use PUT URL (10-minute expiry,
${UPLOAD_MAX_BYTES} bytes max). Send the raw file from your shell:

    curl -sS -X PUT -H "Content-Type: application/octet-stream" --data-binary @file.pdf "<uploadUrl>"

The response is a receipt with byte count and sha256 — compare against the local file to
confirm integrity. A 409 means the ticket was already used: DO NOT retry (the first upload
likely landed and cannot be deleted); a 502 means AccuLynx rejected it and one retry is safe.

**Fallback: inline content.** File-bearing commands ("documents add", "photos upload", the
measurements uploads) also accept the file content itself, in any of these string forms:

- **https URL** — fetched server-side (photo/video uploads hand the URL to AccuLynx directly).
  Use this for anything over ~3 MB.
- **data: URI** — \`data:application/pdf;name=contract.pdf;base64,<payload>\`. The \`;name=\`
  parameter sets the filename stored in AccuLynx; include it whenever the filename matters
  (documents especially).
- **bare base64** — just the payload string, no prefix. The file type is sniffed from the
  content (PNG/JPEG/GIF/WEBP/PDF/MP4/MOV/HEIC/ZIP).

Pass \`fileName\` alongside the file input to control the name stored in AccuLynx
(e.g. "McPherson Supplement 1.pdf") — recommended for base64 and URL inputs, which otherwise
get a generated name.

Inline forms are capped at 25 MB decoded, but the request body itself is limited to ~4.5 MB,
so an inline upload tops out around a 3 MB file — send anything larger by https URL. If an
upload is rejected for size, switch to a URL rather than retrying inline.

Document ingest is asynchronous: "documents add" returns 202 Accepted with no body — AccuLynx
provides no API to list, fetch, or delete a job's documents, so there is no id to return and
no way to confirm or undo an upload here. Verify in the AccuLynx UI, and do not blind-retry a
timed-out upload (it may have landed).`;

export function buildServer(serverOpts: { baseUrl?: string } = {}): McpServer {
  const server = new McpServer(
    { name: "acculynx", version: MCP_SERVER_VERSION },
    { instructions: INSTRUCTIONS },
  );

  // Registered only when the deployment can sign tickets (same secret as OAuth).
  if (process.env.SIGNING_SECRET) {
    server.registerTool(
      "acculynx_request_upload",
      {
        title: "Request a direct-upload URL for a job document",
        description:
          "Mint a single-use, 10-minute PUT URL bound to a job, document folder, and filename. " +
          "PUT the raw file bytes to it (curl --data-binary @file) — no base64, no bytes through " +
          "context. Returns uploadUrl, expiresAt, maxBytes, and a ready-to-run curl example. " +
          "The response to the PUT is a receipt with sha256 and byte count. On 409 (ticket already " +
          "used) do NOT retry — the first upload likely landed and AccuLynx has no delete API.",
        inputSchema: {
          jobId: z.string().describe("Target Job UUID"),
          documentFolderId: z.string().describe(
            "Target folder UUID from \"documents folders\" (acculynx_run: documents folders)",
          ),
          fileName: z.string().min(1).describe(
            'Filename to store in AccuLynx, e.g. "McPherson Supplement 1.pdf"',
          ),
          contentType: z.string().optional().describe("MIME type of the file (informational)"),
          description: z.string().optional().describe("Brief file context description"),
        },
      },
      async ({ jobId, documentFolderId, fileName, contentType, description }) => {
        try {
          const secret = process.env.SIGNING_SECRET!;
          const ticket = mintUploadTicket({ jobId, documentFolderId, fileName, contentType, description }, secret);
          const uploadUrl = `${serverOpts.baseUrl ?? ""}/api/uploads/${encodeURIComponent(ticket)}`;
          return ok({
            uploadUrl,
            method: "PUT",
            expiresAt: new Date(Date.now() + UPLOAD_TICKET_TTL_S * 1000).toISOString(),
            maxBytes: UPLOAD_MAX_BYTES,
            curlExample: `curl -sS -X PUT -H "Content-Type: application/octet-stream" --data-binary @"${fileName}" "${uploadUrl}"`,
            _note:
              "Single-use. 200 → receipt with sha256 (verify against your local file). " +
              "409 → already used, do not retry. 502 → AccuLynx rejected it, one retry is safe. " +
              "410 → expired, request a new URL.",
          });
        } catch (error) {
          return toolError(error);
        }
      },
    );
  }

  server.registerTool(
    "acculynx_search",
    {
      title: "Search AccuLynx commands",
      description:
        "Find AccuLynx commands by keyword, matched against group, verb, and description. " +
        "Returns command names with a [read]/[mutates] flag. Start here when you do not already " +
        "know the exact command name. Omit the query to list every command.",
      inputSchema: {
        query: z.string().optional().describe(
          'Keyword to match, e.g. "payment", "insurance", "milestone". Omit to list all commands.',
        ),
      },
    },
    async ({ query }) => {
      try {
        if (!query || !query.trim()) {
          return ok({
            commands: REGISTRY.map((e) => ({
              command: `${e.group} ${e.verb}`,
              mutates: Boolean(e.config.approval),
            })),
            _note: "Use acculynx_describe for the input schema of any command.",
          });
        }
        return ok(searchCommands(query.trim()));
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    "acculynx_describe",
    {
      title: "Describe an AccuLynx command",
      description:
        "Return the full JSON Schema for a command's input, plus a runnable example and whether " +
        "it mutates data. Call this before running any command you have not used this session.",
      inputSchema: {
        command: z.string().describe('Command name as "<group> <verb>", e.g. "jobs get".'),
      },
    },
    async ({ command }) => {
      try {
        const { group, verb } = parseCommand(command);
        return ok(describeCommand(group, verb));
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    "acculynx_run",
    {
      title: "Run an AccuLynx command",
      description:
        "Execute an AccuLynx command. Pass every argument as a JSON object in `input` — both what " +
        "the CLI exposes as flags and what it takes via --json. Confirm amounts, dates, recipients, " +
        "and message text with the user before running anything marked [mutates].",
      inputSchema: {
        command: z.string().describe('Command name as "<group> <verb>", e.g. "jobs get".'),
        input: z.record(z.string(), z.unknown()).optional().describe(
          'Arguments as a JSON object, e.g. {"jobId":"3fa85f64-..."}. See acculynx_describe.',
        ),
        fields: z.array(z.string()).optional().describe(
          "Restrict list output to these fields (dot paths allowed). Overrides the default projection.",
        ),
        full: z.boolean().optional().describe(
          "Return complete records instead of the concise projection. Costly on large lists.",
        ),
        limitChars: z.number().int().min(0).optional().describe(
          `Truncate the response at N characters (0 disables). Defaults to ${CHARACTER_LIMIT}.`,
        ),
      },
    },
    async ({ command, input, fields, full, limitChars }) => {
      try {
        const { group, verb } = parseCommand(command);
        const entry = findEntry(group, verb);
        if (!entry) {
          throw new UsageError(
            `Unknown command: "${group} ${verb}".`,
            `Run acculynx_search with "${verb}" to find the right one.`,
          );
        }
        if (DISK_WRITING_TOOLS.has(entry.tool)) {
          throw new UsageError(
            `"${group} ${verb}" renders a PDF to local disk and is not available over MCP.`,
            "Generate this document with the local acculynx CLI, or use the draft-coc / " +
              "generate-roof-report skills, then upload with \"documents add\".",
          );
        }

        const shape = introspect(entry.config.inputSchema);
        const parsed = validateInput(entry, shape, (input ?? {}) as Record<string, unknown>);

        requireApiKey();
        const client = getAccuLynxClient();
        const result = await entry.config.call(client, parsed, { baseUrl: serverOpts.baseUrl });

        const opts: GlobalOptions = {
          format: "json",
          full: full === true,
          fields,
          limitChars: limitChars ?? CHARACTER_LIMIT,
        };
        const payload = postprocess(entry, result, opts);

        let text = JSON.stringify(payload, null, 1);
        if (opts.limitChars > 0 && text.length > opts.limitChars) {
          text =
            text.slice(0, opts.limitChars) +
            `\n...[truncated at ${opts.limitChars} chars — narrow with fields, pageSize, or filters; raise with limitChars]`;
        }
        return { content: [{ type: "text" as const, text }] };
      } catch (error) {
        return toolError(error);
      }
    },
  );

  return server;
}
