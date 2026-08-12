import { defineTool } from "../lib/define-tool.ts";
import { always } from "../lib/approval.ts";
import { z } from "zod";
import { mintUploadTicket, UPLOAD_MAX_BYTES, UPLOAD_TICKET_TTL_S } from "../mcp/uploads.ts";

export default defineTool({
  description:
    "Mint a single-use, 10-minute direct-upload URL for a job document. PUT the raw file bytes to " +
    "the returned uploadUrl (curl --data-binary @file) — no base64, no file content in tool calls. " +
    "The PUT response is a receipt with sha256 and byte count. On 409 (ticket already used) do NOT " +
    "retry: the first upload likely landed and AccuLynx has no delete API. On 502 one retry is safe. " +
    "Hosted MCP server only. This mutates AccuLynx data (via the subsequent PUT) and requires " +
    "explicit human approval before it executes.",
  approval: always(),
  inputSchema: z.object({
    jobId: z.string().guid().describe("Target Job UUID"),
    documentFolderId: z.string().guid().describe("Target folder UUID from: acculynx documents folders"),
    fileName: z.string().min(1).describe('Filename to store in AccuLynx, e.g. "McPherson Supplement 1.pdf"'),
    contentType: z.string().optional().describe("MIME type of the file (informational)"),
    description: z.string().optional().describe("Brief file context description"),
  }),
  async execute({ jobId, documentFolderId, fileName, contentType, description }, ctx) {
    const secret = process.env.SIGNING_SECRET;
    if (!secret) {
      throw new Error(
        "documents request-upload mints signed URLs and needs SIGNING_SECRET, which only the hosted " +
          'MCP server has. Locally, pass a file path straight to "documents add" instead.',
      );
    }
    const baseUrl = ctx?.baseUrl || process.env.ACCULYNX_MCP_BASE_URL || "";
    const ticket = mintUploadTicket({ jobId, documentFolderId, fileName, contentType, description }, secret);
    const uploadUrl = `${baseUrl}/api/uploads/${encodeURIComponent(ticket)}`;
    const data = {
      uploadUrl,
      method: "PUT",
      expiresAt: new Date(Date.now() + UPLOAD_TICKET_TTL_S * 1000).toISOString(),
      maxBytes: UPLOAD_MAX_BYTES,
      curlExample: `curl -sS -X PUT -H "Content-Type: application/octet-stream" --data-binary @"${fileName}" "${uploadUrl}"`,
      _note:
        "Single-use. 200 → receipt with sha256 (verify against your local file). " +
        "409 → already used, do not retry. 502 → AccuLynx rejected it, one retry is safe. " +
        "410 → expired, request a new URL.",
    };
    return { text: JSON.stringify(data, null, 2), data };
  },
  toModelOutput(output) {
    return { type: "text", value: output.text };
  },
});
