import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { always } from "../lib/approval.ts";
import { z } from "zod";

const contactAddress = z.object({
  street1: z.string().optional(),
  street2: z.string().optional(),
  city: z.string().optional(),
  zipCode: z.string().optional(),
  state: z.object({ id: z.number().describe("Numerical state id (see acculynx settings country-states)") }).optional(),
  country: z.object({ id: z.number().describe("Numerical country id (see acculynx settings countries)") }).optional(),
});

export default defineAcculynxTool({
  approval: always(),
  description: "Provision a new contact profile within AccuLynx. Returns created entity details including its assigned UUID.",
  inputSchema: z.object({
    firstName: z.string().optional().describe("First name of the contact"),
    lastName: z.string().optional().describe("Last name of the contact"),
    companyName: z.string().optional().describe("Company name of the contact"),
    contactTypeIds: z.array(z.string().guid()).optional().describe("Array of Contact Type UUIDs (retrieve via acculynx_get_contact_types)"),
    phoneNumbers: z.array(z.object({
      number: z.string().regex(/^\d{10}$/, "Must be exactly 10 digits without delimiters").describe("10 digit phone number"),
      type: z.enum(["Home", "Mobile", "Work"]).default("Home").describe("Classification of phone number"),
      primary: z.boolean().optional(),
    })).optional(),
    emailAddresses: z.array(z.object({
      address: z.string().email().describe("Valid email address"),
      primary: z.boolean().optional(),
      type: z.enum(["Personal", "Work", "Other"]).optional(),
    })).optional(),
    note: z.string().optional().describe("Additional descriptive documentation note"),
    companyJobTitle: z.string().optional().describe("Job title of the contact"),
    crossReference: z.string().optional().describe("Cross-reference identifier for the contact (e.g. an external system id)"),
    mailingAddress: contactAddress.optional().describe("Mailing address of the contact"),
    billingAddress: contactAddress.optional().describe("Billing address of the contact"),
    billingAddressSameAsMailingAddress: z.boolean().optional().describe("Indicates if the billing address is the same as the mailing address"),
  }),
  async call(client, payload) {
    const res = await client.postContacts(payload);
    return res.data;
  },
});
