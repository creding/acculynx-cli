import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { z } from "zod";
import { ResponseFormat } from "../lib/constants.ts";

export default defineAcculynxTool({
  description: "Get a single milestone for a job by milestone id.",
  inputSchema: z.object({
    jobId: z.string().describe("The job's unique identifier"),
    milestoneId: z.string().describe("The milestone unique identifier"),
    includes: z.string().describe("Optional fields to include in full with the response.").optional(),
    response_format: z.nativeEnum(ResponseFormat).optional().describe("Output serialization format"),
  }),
  async call(client, { jobId, milestoneId, includes }) {
    const res = await client.getJobMilestoneById({ jobId, milestoneId, includes });
    return res.data;
  },
});
