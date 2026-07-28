import { defineTool } from "../lib/define-tool.ts";
import { z } from "zod";
import { ResponseFormat } from "../lib/constants.ts";
import { getAccuLynxClient, handleApiError, formatToolResponse } from "../lib/acculynx.ts";

export default defineTool({
  description: "Retrieve initial appointment scheduling dates and metadata for a specific job mapped by its unique UUID.",
  inputSchema: z.object({
    jobId: z.string().guid().describe("Unique UUID string identifying the target job"),
    response_format: z.nativeEnum(ResponseFormat).optional().describe("Output serialization format"),
  }),
  async execute({ jobId, response_format }, ctx) {
    try {
      const client = getAccuLynxClient();
      const res = await client.getInitialAppointmentForJob({ jobId });
      return formatToolResponse(res.data, response_format);
    } catch (error) {
      const anyErr = error as any;
      const status = anyErr.status || anyErr.response?.status || anyErr.data?.status;
      if (status === 404) {
        return formatToolResponse({ message: "No initial appointment scheduled for this job." }, response_format);
      }
      throw new Error(handleApiError(error));
    }
  },
  toModelOutput(output) {
    return { type: "text", value: output.text };
  },
});
