import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { z } from "zod";
import { ResponseFormat } from "../lib/constants.ts";

export default defineAcculynxTool({
  description: "Get Estimate Section",
  inputSchema: z.object({
    estimateId: z.string().describe("The estimate's unique identifier"),
    estimateSectionId: z.string().describe("The estimate section's unique identifier"),
    includes: z.string().describe("Optional fields to include in full with the response.").optional(),
    response_format: z.nativeEnum(ResponseFormat).optional().describe("Output serialization format"),
  }),
  async call(client, { estimateId, estimateSectionId, includes }) {
    const res = await client.getEstimateSectionById({ estimateId, estimateSectionId, includes });
    return res.data;
  },
});
