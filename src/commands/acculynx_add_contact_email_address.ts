import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { always } from "../lib/approval.ts";
import { z } from "zod";

export default defineAcculynxTool({
  description: "Add a new email address to an existing contact. The first email added becomes the contact's primary address. This mutates AccuLynx data and requires explicit human approval before it executes.",
  approval: always(),
  inputSchema: z.object({
    contactId: z.string().describe("The contact's unique identifier"),
    body: z.object({
      address: z.string().email().describe("Valid email address"),
      type: z.enum(["Personal", "Work", "Other"]).default("Personal")
        .describe("Classification of the email address"),
    }),
  }),
  async call(client, { body, contactId }) {
    const res = await client.postContactEmailAddresses(body, { contactId });
    return res.data || { success: true, message: "Email address added." };
  },
});
