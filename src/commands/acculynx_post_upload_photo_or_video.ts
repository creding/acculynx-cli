import { defineTool } from "../lib/define-tool.ts";
import { always } from "../lib/approval.ts";
import { z } from "zod";
import {
  getAccuLynxClient,
  handleApiError,
  formatToolResponse,
  resolveSandboxFile,
  preferFileUriForUrls,
} from "../lib/acculynx.ts";

export default defineTool({
  description: "Upload a photo or video to a Job This mutates AccuLynx data and requires explicit human approval before it executes.",
  approval: always(),
  inputSchema: z.object({
    jobId: z.string().describe("The job's unique identifier"),
    fileName: z.string().optional().describe(
      "Filename to store in AccuLynx (e.g. 'front-elevation.jpg'). Overrides any name derived from " +
        "the file input; recommended for base64 inputs, which otherwise get a generated name.",
    ),
    body: z.object({
    file: z
      .string()
      .describe(
        "File to upload: a local path (e.g. 'photo.jpg'), an https URL (handed to AccuLynx as fileUri), " +
          "a data: URI (add ;name=<filename> before ;base64 to set the stored filename), or a bare base64 string " +
          "(file type sniffed from content; 25 MB max)",
      )
      .optional(),
    description: z.string().describe("A brief description related to the file that is being uploaded.").optional(),
    tags: z.string().describe("A comma-separated list of 'GUID' to be applier to the photo or video. The tags should exist within the location.").optional(),
    fileUri: z.string().describe("The URI of the file to upload. This image will be uploaded if the 'File' field is not selected.").optional(),
    externalId: z.string().describe("A field to link the file with a job external reference identifier").optional(),
    externalSource: z.string().describe("A field to link the file with a job external reference source").optional()
  }),
  }),
  async execute({ body, jobId, fileName }, ctx) {
    let resolvedBody = preferFileUriForUrls(body);
    let cleanup = async () => {};
    try {
      const client = getAccuLynxClient();
      if (resolvedBody.file) {
        const fileRes = await resolveSandboxFile(resolvedBody.file, ctx, { fileName });
        if (fileRes) {
          resolvedBody = { ...resolvedBody, file: fileRes.path };
          cleanup = fileRes.cleanup;
        }
      }

      const res = await client.postUploadPhotoOrVideo(resolvedBody, { jobId });
      return formatToolResponse(res.data || { success: true, message: "Operation completed successfully." }, undefined);
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
