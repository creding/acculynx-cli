import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { always } from "../lib/approval.ts";
import { z } from "zod";

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
  }),
  async call(client, payload) {
    const res = await client.postContacts(payload);
    return res.data;
  },
});
