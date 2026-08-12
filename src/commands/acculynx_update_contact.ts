import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { always } from "../lib/approval.ts";
import { z } from "zod";

const address = z.object({
  street1: z.string().optional(),
  street2: z.string().optional(),
  city: z.string().optional(),
  zipCode: z.string().optional(),
  state: z.object({
    id: z.number().describe("Numeric state id (retrieve via acculynx_get_accu_lynx_states)"),
  }).optional(),
  country: z.object({
    id: z.number().describe("Numeric country id (retrieve via acculynx_get_accu_lynx_countries)"),
  }).optional(),
});

export default defineAcculynxTool({
  description: "Update an existing contact's profile (name, company, cross reference, mailing/billing address). The API treats this as a full replacement: contactTypeIds (retrieve via acculynx_get_contact_types) and lastName are required on every call, and omitted optional fields may be cleared — fetch the contact first and resend values you want to keep. Phone numbers and email addresses are managed separately (acculynx_add_contact_phone_number / acculynx_add_contact_email_address). This mutates AccuLynx data and requires explicit human approval before it executes.",
  approval: always(),
  inputSchema: z.object({
    contactId: z.string().describe("The contact's unique identifier"),
    body: z.object({
      contactTypeIds: z.array(z.string().guid()).min(1)
        .describe("Contact type UUIDs (retrieve via acculynx_get_contact_types); required by the API on every update"),
      firstName: z.string().max(50).optional().describe("First name of the contact"),
      lastName: z.string().max(50).describe("Last name of the contact (required by the API on every update)"),
      crossReference: z.string().max(250).optional().describe("CrossReference identifier of the contact"),
      companyName: z.string().max(100).optional().describe("Company name of the contact"),
      companyJobTitle: z.string().optional().describe("Job title of the contact"),
      mailingAddress: address.optional(),
      billingAddress: address.optional(),
      billingAddressSameAsMailingAddress: z.boolean().optional()
        .describe("Set true to copy the mailing address to the billing address"),
    }),
  }),
  async call(client, { body, contactId }) {
    const res = await client.putContact(body, { contactId });
    return res.data || { success: true, message: "Contact updated." };
  },
});
