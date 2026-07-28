import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { z } from "zod";
import { ResponseFormat } from "../lib/constants.ts";

export default defineAcculynxTool({
  description: "Get all the supplements across the company.",
  inputSchema: z.object({
    pageSize: z.number().describe("How many items to be returned at a time.").optional(),
    recordStartIndex: z.number().describe("The index of the first element to return").optional(),
    includes: z.string().describe("Optional fields to include in full with the response.").optional(),
    jobId: z.string().describe("The job's unique identifier").optional(),
    response_format: z.nativeEnum(ResponseFormat).optional().describe("Output serialization format"),
  }),
  async call(client, { pageSize, recordStartIndex, includes, jobId }) {
    const res = await client.getFinancialsSupplementsForCompany({ pageSize, recordStartIndex, includes, jobId });
    return res.data;
  },
});
