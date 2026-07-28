import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { z } from "zod";
import { ResponseFormat } from "../lib/constants.ts";

export default defineAcculynxTool({
  description: "Retrieve a list of invoices issued for a specific job mapped by its unique UUID.",
  inputSchema: z.object({
    jobId: z.string().guid().describe("Unique UUID string identifying the target job"),
    pageSize: z.number().optional().describe("How many items to be returned at a time"),
    pageStartIndex: z.number().optional().describe("The index of the first element to return"),
    response_format: z.nativeEnum(ResponseFormat).optional().describe("Output serialization format"),
  }),
  async call(client, { jobId, pageSize, pageStartIndex }) {
    const metadata: any = { jobId, pageSize: pageSize ?? 25 };
    if (pageStartIndex !== undefined) metadata.pageStartIndex = pageStartIndex;
    const res = await client.getInvoicesForJob(metadata);
    return res.data;
  },
});
