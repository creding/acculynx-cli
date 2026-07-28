import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { always } from "../lib/approval.ts";
import { z } from "zod";

export default defineAcculynxTool({
  description: "Sets multiple custom field values for a contact by id This mutates AccuLynx data and requires explicit human approval before it executes.",
  approval: always(),
  inputSchema: z.object({
    contactId: z.string().describe("The contact's unique identifier"),
    body: z.object({
    customFields: z.array(z.object({
        id: z.string().describe("The unique identifier of the AccuLynx custom field item."),
        fieldType: z.enum(["Text", "Number", "Date", "Boolean"]),
        values: z.array(z.string())
      })).optional()
  }),
  }),
  async call(client, { body, contactId }) {
    const res = await client.putContactCustomFields(body, { contactId });
    return res.data || { success: true, message: "Operation completed successfully." };
  },
});
