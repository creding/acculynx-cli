import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { always } from "../lib/approval.ts";
import { z } from "zod";

export default defineAcculynxTool({
  description: "Delete the job Initial Appointment. This mutates AccuLynx data and requires explicit human approval before it executes.",
  approval: always(),
  inputSchema: z.object({
    jobId: z.string().describe("The job's unique identifier"),
    body: z.object({
    note: z.string().describe("Initial appointment removal description note.").optional()
  }),
  }),
  async call(client, { body, jobId }) {
    const res = await client.deleteJobInitialAppointment(body, { jobId });
    return res.data || { success: true, message: "Operation completed successfully." };
  },
});
