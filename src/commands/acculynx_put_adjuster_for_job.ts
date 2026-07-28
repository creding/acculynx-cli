import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { always } from "../lib/approval.ts";
import { z } from "zod";

export default defineAcculynxTool({
  description: "Set/Update Job Adjuster Information. This mutates AccuLynx data and requires explicit human approval before it executes.",
  approval: always(),
  inputSchema: z.object({
    jobId: z.string().describe("The job's unique identifier"),
    body: z.object({
    adjusterName: z.string().describe("The adjuster's name").optional(),
    phone: z.object({
      number: z.string().describe("10 digit phone number.").optional(),
      ext: z.string().optional(),
      type: z.enum(["Home", "Mobile", "Work"]).optional()
    }).describe("The adjuster's phone number.").optional(),
    fax: z.string().describe("The adjuster's fax").optional(),
    email: z.string().describe("The adjuster's email").optional(),
    claimApproved: z.boolean().describe("a true or false flag indicating whether or not the claim was approved").optional(),
    claimApprovedDate: z.string().describe("The date on which the claim was approved.").optional(),
    metWithAdjuster: z.boolean().describe("a true or false flag indicating whether or not the party met with the adjuster").optional(),
    metWithAdjusterDate: z.string().describe("The date on which the party met with the adjuster.").optional()
  }),
  }),
  async call(client, { body, jobId }) {
    const res = await client.putAdjusterForJob(body, { jobId });
    return res.data || { success: true, message: "Operation completed successfully." };
  },
});
