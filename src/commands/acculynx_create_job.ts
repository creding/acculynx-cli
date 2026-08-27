import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { always } from "../lib/approval.ts";
import { z } from "zod";
import { handleApiError } from "../lib/acculynx.ts";

export default defineAcculynxTool({
  approval: always(),
  description: "Create a new lead/job entity linked to a contact record. Returns the newly provisioned job UUID reference.",
  inputSchema: z.object({
    contact: z.object({
      id: z.string().guid().describe("Target Contact UUID linking the job record"),
    }).describe("Required contact entity binding"),
    leadSource: z.object({
      id: z.string().guid().describe("Lead Source UUID retrieved from acculynx_get_lead_sources"),
    }).optional(),
    locationAddress: z.object({
      street1: z.string(),
      street2: z.string().optional(),
      city: z.string(),
      state: z.string().describe("State abbreviation e.g. TX, MI"),
      country: z.string().describe("Country abbreviation e.g. US"),
      zipCode: z.string(),
    }).optional(),
    priority: z.enum(["Urgent", "High", "Normal"]).optional().describe("Workflow lead prioritization"),
    jobCategory: z.object({
      id: z.number().describe("Job category numerical ID"),
    }).optional(),
    workType: z.object({
      id: z.number().describe("Work type numerical ID"),
    }).optional(),
    tradeTypes: z.array(z.object({
      id: z.string().guid().describe("Trade Type UUID"),
    })).optional(),
    notes: z.string().max(1000).optional().describe("Initial job description remarks"),
    salesOwnerIds: z.array(z.string().guid()).optional().describe("User UUIDs to assign as Sales Owners for the job"),
    companyRepresentativeIds: z.array(z.string().guid()).optional().describe("User UUIDs to assign as Company Representatives"),
    arOwnerIds: z.array(z.string().guid()).optional().describe("User UUIDs to assign as Accounts Receivable (AR) Owners"),
  }),
  async call(client, payload) {
    const { salesOwnerIds, companyRepresentativeIds, arOwnerIds, ...jobPayload } = payload;
    
    const res = await client.createJob(jobPayload);
    const jobId = res.data?.id || (Array.isArray(res.data) && res.data.length > 0 ? res.data[0].id : null);
    
    let assignmentErrors: string[] = [];
    if (jobId) {
      // Add a 1-second delay to prevent race conditions on the AccuLynx backend
      // where immediate assignments are ignored or fail silently due to eventual consistency.
      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (salesOwnerIds && salesOwnerIds.length > 0) {
        for (const id of salesOwnerIds) {
          await client.postSalesOwnerForJob({ id }, { jobId }).catch((err: any) => assignmentErrors.push(`SalesOwner ${id}: ${handleApiError(err)}`));
        }
      }
      if (companyRepresentativeIds && companyRepresentativeIds.length > 0) {
        for (const id of companyRepresentativeIds) {
          await client.postCompanyRepresentativeForJob({ id }, { jobId }).catch((err: any) => assignmentErrors.push(`CompanyRep ${id}: ${handleApiError(err)}`));
        }
      }
      if (arOwnerIds && arOwnerIds.length > 0) {
        for (const id of arOwnerIds) {
          await client.postAROwnerForJob({ id }, { jobId }).catch((err: any) => assignmentErrors.push(`AROwner ${id}: ${handleApiError(err)}`));
        }
      }
    }
    
    const responseData = res.data || {};
    if (assignmentErrors.length > 0) {
        responseData.assignmentErrors = assignmentErrors;
    }
    return responseData;
  },
});
