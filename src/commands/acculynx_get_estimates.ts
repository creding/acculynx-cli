import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { z } from "zod";
import { ResponseFormat } from "../lib/constants.ts";

export default defineAcculynxTool({
  description: "Get Estimates",
  inputSchema: z.object({
    pageSize: z.number().describe("How many items to be returned at a time.").optional(),
    pageStartIndex: z.number().describe("The index of the page to return").optional(),
    includes: z.string().describe("Optional fields to include in full with the response.").optional(),
    response_format: z.nativeEnum(ResponseFormat).optional().describe("Output serialization format"),
  }),
  async call(client, { pageSize, pageStartIndex, includes }) {
    const res = await client.getEstimates({ pageSize, pageStartIndex, includes });
    return res.data;
  },
});
