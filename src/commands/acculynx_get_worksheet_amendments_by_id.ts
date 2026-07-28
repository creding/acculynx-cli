import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { z } from "zod";
import { ResponseFormat } from "../lib/constants.ts";

export default defineAcculynxTool({
  description: "Get Financial Amendments",
  inputSchema: z.object({
    financialsId: z.string().describe("The Financial's unique identifier"),
    pageSize: z.number().describe("How many items to be returned at a time.").optional(),
    pageStartIndex: z.number().describe("The index of the page to return").optional(),
    response_format: z.nativeEnum(ResponseFormat).optional().describe("Output serialization format"),
  }),
  async call(client, { financialsId, pageSize, pageStartIndex }) {
    const res = await client.getWorksheetAmendmentsById({ financialsId, pageSize, pageStartIndex });
    return res.data;
  },
});
