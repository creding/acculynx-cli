import { defineTool } from "../lib/define-tool.ts";
import { always } from "../lib/approval.ts";
import { z } from "zod";
import { getAccuLynxClient, handleApiError, formatToolResponse, resolveSandboxFile } from "../lib/acculynx.ts";

export default defineTool({
  approval: always(),
  description: "Upload a physical document attachment directly into a designated Job folder mapping.",
  inputSchema: z.object({
    jobId: z.string().guid().describe("Target Job UUID where file will be uploaded"),
    documentFolderId: z.string().guid().describe("Target Folder UUID retrieved from acculynx_get_company_document_folders"),
    file: z.string().describe("Local file name (e.g. 'proposal.pdf') or path in the sandbox to be uploaded"),
    description: z.string().optional().describe("Brief file context description"),
  }),
  async execute({ jobId, documentFolderId, file, description }, ctx) {
    let resolvedFile = file;
    let cleanup = async () => {};
    try {
      const fileRes = await resolveSandboxFile(file, ctx);
      if (fileRes) {
        resolvedFile = fileRes.path;
        cleanup = fileRes.cleanup;
      }

      const client = getAccuLynxClient();
      const res = await client.postAddJobDocument(
        {
          file: resolvedFile,
          documentFolderId,
          description,
        },
        { jobId }
      );
      return formatToolResponse(
        res.data || { success: true, message: "Document uploaded successfully." },
        undefined
      );
    } catch (error) {
      throw new Error(handleApiError(error));
    } finally {
      await cleanup().catch(() => {});
    }
  },
  toModelOutput(output) {
    return { type: "text", value: output.text };
  },
});
