import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { always } from "../lib/approval.ts";
import { z } from "zod";

export default defineAcculynxTool({
  description: "Set Insurance Information for an existing Job. This mutates AccuLynx data and requires explicit human approval before it executes.",
  approval: always(),
  inputSchema: z.object({
    jobId: z.string().describe("The job's unique identifier"),
    body: z.object({
    insuranceCompany: z.object({
      insuranceCompanyId: z.string().describe("The insurance company's unique ID is to be set to the job.").optional(),
      insuranceCompanyName: z.string().describe("A job can have an insurance company that is not from the list managed in Account Settings. In this case, the 'insuranceCompanyId' should be null. The text will be assigned to the comments field for the 'Other' (active) insurance company.").optional()
    }).optional(),
    customInsuranceCompanyName: z.string().describe("A job can have an Insurance Company that is not from the list managed in Account Settings. In this case, `insuranceCompany` will be null.").optional(),
    damagelocation: z.string().describe("Where the damage is located.").optional(),
    dateOfLoss: z.string().describe("The date the damage occurred in UTC.").optional(),
    claimFiled: z.boolean().describe("Has the claim been filed? Must be true if `claimFiledDate` is populated.").optional(),
    claimFiledDate: z.string().describe("The date the claim was filed in UTC.").optional(),
    claimNumber: z.string().describe("The identifier of the insurance claim given by the insurance company.").optional(),
    hasPaperwork: z.boolean().describe("Is the paperwork for this job collected?").optional()
  }),
  }),
  async call(client, { body, jobId }) {
    const res = await client.putInsuranceInformationForJob(body, { jobId });
    return res.data || { success: true, message: "Operation completed successfully." };
  },
});
