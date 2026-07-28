import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { always } from "../lib/approval.ts";
import { z } from "zod";

export default defineAcculynxTool({
  description: "Update job work type This mutates AccuLynx data and requires explicit human approval before it executes.",
  approval: always(),
  inputSchema: z.object({
    jobId: z.string().describe("The job's unique identifier"),
    body: z.object({
    id: z.number().describe("The work type unique identifier.")
  }),
  }),
  async call(client, { body, jobId }) {
    const res = await client.updateJobWorkType(body, { jobId });
    return res.data || { success: true, message: "Operation completed successfully." };
  },
});
