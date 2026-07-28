import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { always } from "../lib/approval.ts";
import { z } from "zod";

export default defineAcculynxTool({
  description: "Set the priority for an existing Job. This mutates AccuLynx data and requires explicit human approval before it executes.",
  approval: always(),
  inputSchema: z.object({
    jobId: z.string().describe("The job's unique identifier"),
    body: z.object({
    priority: z.enum(["Urgent", "High", "Normal"])
  }),
  }),
  async call(client, { body, jobId }) {
    const res = await client.putPriorityForJob(body, { jobId });
    return res.data || { success: true, message: "Operation completed successfully." };
  },
});
