import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { z } from "zod";
import { ResponseFormat } from "../lib/constants.ts";

export default defineAcculynxTool({
  description: "Retrieve the line-item sections of a specific Estimate by its UUID. First obtain the estimate UUID from acculynx_get_job_estimates.",
  inputSchema: z.object({
    estimateId: z.string().guid().describe("Unique UUID of the estimate (from acculynx_get_job_estimates)"),
    response_format: z.nativeEnum(ResponseFormat).optional().describe("Output serialization format"),
  }),
  async call(client, { estimateId }) {
    const res = await client.getEstimateSections({ estimateId });
    return res.data;
  },
});
