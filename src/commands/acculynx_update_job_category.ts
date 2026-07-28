import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { always } from "../lib/approval.ts";
import { z } from "zod";

export default defineAcculynxTool({
  description: "Update Job Category. This mutates AccuLynx data and requires explicit human approval before it executes.",
  approval: always(),
  inputSchema: z.object({
    jobId: z.string().describe("The job's unique identifier"),
    body: z.object({
    id: z.string().describe("The unique identifier of the job category to set.")
  }),
  }),
  async call(client, { body, jobId }) {
    const res = await client.updateJobCategory(body, { jobId });
    return res.data || { success: true, message: "Operation completed successfully." };
  },
});
