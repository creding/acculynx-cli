import { defineTool } from "../lib/define-tool.ts";
import { always } from "../lib/approval.ts";
import { z } from "zod";
import { getAccuLynxClient, handleApiError, formatToolResponse, resolveSandboxFiles } from "../lib/acculynx.ts";

export default defineTool({
  description: "Create manual measurements for a job. This mutates AccuLynx data and requires explicit human approval before it executes.",
  approval: always(),
  inputSchema: z.object({
    jobId: z.string().describe("The job's unique identifier"),
    body: z.object({
    measurementsFile: z.string().describe(
      "Manual measurements file (XML or JSON format): a local path, an https URL (downloaded server-side, 25 MB max), " +
        "a data: URI (add ;name=<filename> to set the stored filename), or a bare base64 string",
    )
  }),
  }),
  async execute({ body, jobId }, ctx) {
    let resolvedBody = body;
    let cleanup = async () => {};
    try {
      const client = getAccuLynxClient();
      const resolveRes = await resolveSandboxFiles(body, ctx);
      resolvedBody = resolveRes.resolved;
      cleanup = resolveRes.cleanup;

      const res = await client.postJobMeasurementsUpload(resolvedBody, { jobId });
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
