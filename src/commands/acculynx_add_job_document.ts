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
    file: z
      .string()
      .describe(
        "File to upload: a local path (e.g. 'proposal.pdf'), an https URL (downloaded server-side, 25 MB max), " +
          "a data: URI (add ;name=<filename> before ;base64 to set the stored filename), or a bare base64 string " +
          "(file type sniffed from content)",
      ),
    fileName: z.string().optional().describe(
      "Filename to store in AccuLynx (e.g. 'McPherson Supplement 1.pdf'). Overrides any name derived " +
        "from the input; recommended for base64 and URL inputs, which otherwise get a generated name.",
    ),
    description: z.string().optional().describe("Brief file context description"),
    externalId: z.string().optional().describe("Link the file to a job external reference identifier"),
    externalSource: z.string().optional().describe("Link the file to a job external reference source"),
  }),
  async execute({ jobId, documentFolderId, file, fileName, description, externalId, externalSource }, ctx) {
    let resolvedFile = file;
    let cleanup = async () => {};
    try {
      const fileRes = await resolveSandboxFile(file, ctx, { fileName });
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
          externalId,
          externalSource,
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
