import { defineTool } from "../lib/define-tool.ts";
import { z } from "zod";
import { ResponseFormat } from "../lib/constants.ts";
import { getAccuLynxClient, handleApiError, formatToolResponse } from "../lib/acculynx.ts";

export default defineTool({
  description: "Retrieve insurance claim details (carrier, claim/policy numbers, adjuster info) associated with a specific Job by its UUID.",
  inputSchema: z.object({
    jobId: z.string().guid().describe("Unique UUID string identifying the target job"),
    response_format: z.nativeEnum(ResponseFormat).optional().describe("Output serialization format"),
  }),
  async execute({ jobId, response_format }, ctx) {
    try {
      const client = getAccuLynxClient();
      const res = await client.getInsuranceForJob({ jobId });
      return formatToolResponse(res.data, response_format);
    } catch (error) {
      const anyErr = error as any;
      const status = anyErr.status || anyErr.response?.status || anyErr.data?.status;
      if (status === 404) {
        return formatToolResponse({ message: "No insurance information recorded for this job." }, response_format);
      }
      throw new Error(handleApiError(error));
    }
  },
  toModelOutput(output) {
    return { type: "text", value: output.text };
  },
});
