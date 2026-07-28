import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { always } from "../lib/approval.ts";
import { z } from "zod";

export default defineAcculynxTool({
  description: "Delete A/R Owner This mutates AccuLynx data and requires explicit human approval before it executes.",
  approval: always(),
  inputSchema: z.object({
    jobId: z.string().describe("The job's unique identifier"),
  }),
  async call(client, { jobId }) {
    const res = await client.deleteAROwnerFromJob({ jobId });
    return res.data || { success: true, message: "Operation completed successfully." };
  },
});
