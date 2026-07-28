import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { always } from "../lib/approval.ts";
import { z } from "zod";

export default defineAcculynxTool({
  description: "Sets multiple custom field values for a job by id This mutates AccuLynx data and requires explicit human approval before it executes.",
  approval: always(),
  inputSchema: z.object({
    jobId: z.string().describe("The job's unique identifier"),
    body: z.object({
    customFields: z.array(z.object({
        id: z.string().describe("The unique identifier of the AccuLynx custom field item."),
        fieldType: z.enum(["Text", "Number", "Date", "Boolean"]),
        values: z.array(z.string())
      })).optional()
  }),
  }),
  async call(client, { body, jobId }) {
    const res = await client.putJobCustomFields(body, { jobId });
    return res.data || { success: true, message: "Operation completed successfully." };
  },
});
