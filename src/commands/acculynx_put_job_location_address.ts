import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { always } from "../lib/approval.ts";
import { z } from "zod";

export default defineAcculynxTool({
  description: "Updates job location address information. This mutates AccuLynx data and requires explicit human approval before it executes.",
  approval: always(),
  inputSchema: z.object({
    jobId: z.string().describe("The job's unique identifier"),
    body: z.object({
    street1: z.string().optional(),
    street2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    zipCode: z.string().optional()
  }),
  }),
  async call(client, { body, jobId }) {
    const res = await client.putJobLocationAddress(body, { jobId });
    return res.data || { success: true, message: "Operation completed successfully." };
  },
});
