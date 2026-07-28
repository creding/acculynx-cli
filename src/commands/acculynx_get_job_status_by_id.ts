import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { z } from "zod";
import { ResponseFormat } from "../lib/constants.ts";

export default defineAcculynxTool({
  description: "Get a single status for a milestone by status id.",
  inputSchema: z.object({
    jobId: z.string().describe("The job's unique identifier"),
    milestoneId: z.string().describe("The milestone unique identifier"),
    statusId: z.string().describe("The status unique identifier"),
    response_format: z.nativeEnum(ResponseFormat).optional().describe("Output serialization format"),
  }),
  async call(client, { jobId, milestoneId, statusId }) {
    const res = await client.getJobStatusById({ jobId, milestoneId, statusId });
    return res.data;
  },
});
