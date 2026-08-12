import { defineTool } from "../lib/define-tool.ts";
import { always } from "../lib/approval.ts";
import { z } from "zod";
import { getAccuLynxClient, handleApiError, formatToolResponse, resolveSandboxFiles } from "../lib/acculynx.ts";

export default defineTool({
  description: "Create a new measurements order for a job. This mutates AccuLynx data and requires explicit human approval before it executes.",
  approval: always(),
  inputSchema: z.object({
    jobId: z.string().describe("The job's unique identifier"),
    body: z.object({
    measurementsFile: z.string().describe(
      "Measurements file (XML or JSON format): a local path, an https URL (downloaded server-side, 25 MB max), " +
        "a data: URI (add ;name=<filename> to set the stored filename), or a bare base64 string",
    ).optional(),
    reportPdf: z.string().describe(
      "Order report PDF: a local path, an https URL, a data: URI (;name=<filename> sets the stored name), or a bare base64 string",
    ).optional(),
    miscPdfs: z.array(z.string()).describe(
      "PDFs to attach; each entry accepts a local path, an https URL, a data: URI, or a bare base64 string",
    ).optional(),
    latitude: z.number().describe("Latitude of the map location for the new measurement order, value between -90 and 90."),
    longitude: z.number().describe("Longitude of the map location for the new measurement order, value between -180 and 180."),
    providerMeasurementOrderId: z.string().describe("A text with the provider order identifier, special characters not allowed."),
    providerId: z.enum(["Unknown", "Hover", "RoofSnap", "External"]),
    measurementOrderDescription: z.string().describe("A text with a description of the new measurement order."),
    model3DUrl: z.string().describe("The URL of the 3D model file.").optional(),
    orderedDate: z.string().describe("The creation DateTime for the new measurement order. An ISO 8601 string of datetime including the time component and ending with 'Z' (so in UTC). https://en.wikipedia.org/wiki/ISO_8601#Coordinated_Universal_Time_(UTC)"),
    completedDate: z.string().describe("The completed DateTime for the new measurement order. An ISO 8601 string of datetime including the time component and ending with 'Z' (so in UTC). https://en.wikipedia.org/wiki/ISO_8601#Coordinated_Universal_Time_(UTC)").optional()
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

      const res = await client.postJobMeasurementsUploadFiles(resolvedBody, { jobId });
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
