import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { always } from "../lib/approval.ts";
import { z } from "zod";

export default defineAcculynxTool({
  description: "Add a new phone number to an existing contact. The first number added becomes the contact's primary number. This mutates AccuLynx data and requires explicit human approval before it executes.",
  approval: always(),
  inputSchema: z.object({
    contactId: z.string().describe("The contact's unique identifier"),
    body: z.object({
      number: z.string().regex(/^\d{10}$/, "Must be exactly 10 digits without delimiters")
        .describe("10 digit phone number"),
      ext: z.string().optional().describe("Extension"),
      type: z.enum(["Home", "Mobile", "Work"]).default("Home")
        .describe("Classification of the phone number"),
      smsOptOut: z.boolean().optional()
        .describe("Whether SMS messaging is opted out for this number"),
    }),
  }),
  async call(client, { body, contactId }) {
    const res = await client.postContactPhoneNumber(body, { contactId });
    return res.data || { success: true, message: "Phone number added." };
  },
});
