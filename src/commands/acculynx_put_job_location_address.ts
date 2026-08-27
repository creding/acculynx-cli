import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { always } from "../lib/approval.ts";
import { z } from "zod";

export default defineAcculynxTool({
  description: "Updates job location address information. This mutates AccuLynx data and requires explicit human approval before it executes.",
  approval: always(),
  inputSchema: z.object({
    jobId: z.string().describe("The job's unique identifier"),
    body: z.object({
    street1: z.string().max(250).optional(),
    street2: z.string().max(50).optional(),
    city: z.string().max(50).optional(),
    state: z.string().max(50).optional(),
    country: z.string().max(50).optional(),
    zipCode: z.string().max(10).optional()
  }),
  }),
  async call(client, { body, jobId }) {
    const res = await client.putJobLocationAddress(body, { jobId });
    return res.data || { success: true, message: "Operation completed successfully." };
  },
});
