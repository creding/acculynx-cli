import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { z } from "zod";
import { ResponseFormat } from "../lib/constants.ts";

export default defineAcculynxTool({
  description: "Retrieve the company representatives and assigned owners for a specific Job by its UUID.",
  inputSchema: z.object({
    jobId: z.string().guid().describe("Unique UUID string identifying the target job"),
    pageSize: z.number().optional().describe("How many items to be returned at a time"),
    recordStartIndex: z.number().optional().describe("The index of the first element to return"),
    response_format: z.nativeEnum(ResponseFormat).optional().describe("Output serialization format"),
  }),
  async call(client, { jobId, pageSize, recordStartIndex }) {
    const metadata: any = { jobId, pageSize: pageSize ?? 25 };
    if (recordStartIndex !== undefined) metadata.recordStartIndex = recordStartIndex;
    const res = await client.getRepresentativesForJob(metadata);
    return res.data;
  },
});
