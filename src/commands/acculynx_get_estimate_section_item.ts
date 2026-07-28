import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { z } from "zod";
import { ResponseFormat } from "../lib/constants.ts";

export default defineAcculynxTool({
  description: "Get Estimate Section Item",
  inputSchema: z.object({
    estimateId: z.string().describe("The estimate's unique identifier"),
    estimateSectionId: z.string().describe("The estimate section's unique identifier"),
    estimateItemId: z.string().describe("The estimate item's unique identifier"),
    response_format: z.nativeEnum(ResponseFormat).optional().describe("Output serialization format"),
  }),
  async call(client, { estimateId, estimateSectionId, estimateItemId }) {
    const res = await client.getEstimateSectionItem({ estimateId, estimateSectionId, estimateItemId });
    return res.data;
  },
});
