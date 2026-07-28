import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { z } from "zod";
import { ResponseFormat } from "../lib/constants.ts";

export default defineAcculynxTool({
  description: "Get Insurance Companies.",
  inputSchema: z.object({
    pageSize: z.number().describe("How many items to be returned at a time.").optional(),
    recordStartIndex: z.number().describe("The index of the first element to return").optional(),
    response_format: z.nativeEnum(ResponseFormat).optional().describe("Output serialization format"),
  }),
  async call(client, { pageSize, recordStartIndex }) {
    const res = await client.getInsuranceCompanies({ pageSize, recordStartIndex });
    return res.data;
  },
});
