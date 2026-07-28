import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { z } from "zod";
import { ResponseFormat } from "../lib/constants.ts";

export default defineAcculynxTool({
  description: "Get Estimate Section Items",
  inputSchema: z.object({
    estimateId: z.string().describe("The estimate's unique identifier"),
    estimateSectionId: z.string().describe("The estimate section's unique identifier"),
    response_format: z.nativeEnum(ResponseFormat).optional().describe("Output serialization format"),
  }),
  async call(client, { estimateId, estimateSectionId }) {
    const res = await client.getEstimateSectionItems({ estimateId, estimateSectionId });
    return res.data;
  },
});
