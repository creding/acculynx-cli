import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { z } from "zod";
import { ResponseFormat } from "../lib/constants.ts";

export default defineAcculynxTool({
  description: "Get all the items for a specific supplement.",
  inputSchema: z.object({
    supplementId: z.string().describe("The supplement's unique identifier"),
    pageSize: z.number().describe("How many items to be returned at a time.").optional(),
    recordStartIndex: z.number().describe("The index of the first element to return").optional(),
    response_format: z.nativeEnum(ResponseFormat).optional().describe("Output serialization format"),
  }),
  async call(client, { supplementId, pageSize, recordStartIndex }) {
    const res = await client.getFinancialsSupplementItemCollection({ supplementId, pageSize, recordStartIndex });
    return res.data;
  },
});
