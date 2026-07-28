import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { always } from "../lib/approval.ts";
import { z } from "zod";

export default defineAcculynxTool({
  description: "Create or update the initial appointment for a job. This mutates the job's schedule and requires explicit human approval before it executes.",
  approval: always(),
  inputSchema: z.object({
    jobId: z.string().guid().describe("Unique UUID string identifying the target job"),
    startDate: z.string().describe("Appointment start, ISO 8601 date-time (e.g. 2025-06-01T14:00:00Z)"),
    endDate: z.string().optional().describe("Appointment end, ISO 8601 date-time"),
    notes: z.string().optional().describe("Optional appointment notes"),
  }),
  async call(client, { jobId, startDate, endDate, notes }) {
    const body: any = { startDate };
    if (endDate) body.endDate = endDate;
    if (notes) body.notes = notes;
    const res = await client.putInitialAppointmentForJob(body, { jobId });
    return res.data || { success: true, message: "Initial appointment saved successfully." },
      undefined;
  },
});
