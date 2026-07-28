import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { z } from "zod";
import { ResponseFormat } from "../lib/constants.ts";

export default defineAcculynxTool({
  description: "Get Estimate",
  inputSchema: z.object({
    estimateId: z.string().describe("The estimate's unique identifier"),
    includes: z.string().describe("Optional fields to include in full with the response.").optional(),
    response_format: z.nativeEnum(ResponseFormat).optional().describe("Output serialization format"),
  }),
  async call(client, { estimateId, includes }) {
    const res = await client.getEstimateById({ estimateId, includes });
    return res.data;
  },
});
