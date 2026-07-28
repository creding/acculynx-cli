import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { always } from "../lib/approval.ts";
import { z } from "zod";

export default defineAcculynxTool({
  description: "Log a communication activity (phone call, SMS, or email) against a contact record. This writes to the contact's history and requires explicit human approval before it executes.",
  approval: always(),
  inputSchema: z.object({
    contactId: z.string().guid().describe("Unique UUID of the contact record"),
    logDate: z.string().describe("Date/time the communication occurred, ISO 8601 (e.g. 2025-06-01T14:00:00Z)"),
    type: z.enum(["PhoneCall", "SMS", "Email"]).describe("The type of communication being logged"),
    description: z.string().optional().describe("Details or summary of the communication"),
  }),
  async call(client, { contactId, logDate, type, description }) {
    const body: any = { logDate, type };
    if (description) body.description = description;
    const res = await client.postContactLog(body, { contactId });
    return res.data || { success: true, message: "Contact log entry created successfully." },
      undefined;
  },
});
