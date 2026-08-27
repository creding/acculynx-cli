import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { always } from "../lib/approval.ts";
import { z } from "zod";

export default defineAcculynxTool({
  description: "Set Insurance Company for an existing Job. This mutates AccuLynx data and requires explicit human approval before it executes.",
  approval: always(),
  inputSchema: z.object({
    jobId: z.string().describe("The job's unique identifier"),
    body: z.object({
    insuranceCompanyId: z.string().describe("The insurance company's unique ID is to be set to the job.").optional(),
    insuranceCompanyName: z.string().max(100).describe("A job can have an insurance company that is not from the list managed in Account Settings. In this case, the 'insuranceCompanyId' should be null. The text will be assigned to the comments field for the 'Other' (active) insurance company.").optional()
  }),
  }),
  async call(client, { body, jobId }) {
    const res = await client.putInsuranceCompanyForJob(body, { jobId });
    return res.data || { success: true, message: "Operation completed successfully." };
  },
});
