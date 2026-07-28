import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { always } from "../lib/approval.ts";
import { z } from "zod";

export default defineAcculynxTool({
  description: "Sets a value for a specific custom field for a job by id This mutates AccuLynx data and requires explicit human approval before it executes.",
  approval: always(),
  inputSchema: z.object({
    jobId: z.string().describe("The job's unique identifier"),
    customFieldId: z.string().describe("The ID of the custom field"),
    body: z.object({
    fieldType: z.enum(["Text", "Number", "Date", "Boolean"]).optional(),
    values: z.array(z.string()).optional()
  }),
  }),
  async call(client, { body, jobId, customFieldId }) {
    const res = await client.putJobCustomFieldById(body, { jobId, customFieldId });
    return res.data || { success: true, message: "Operation completed successfully." };
  },
});
