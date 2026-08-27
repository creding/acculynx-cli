import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { always } from "../lib/approval.ts";
import { z } from "zod";

export default defineAcculynxTool({
  description: "Create Payment Additional Job Expenses This mutates AccuLynx data and requires explicit human approval before it executes.",
  approval: always(),
  inputSchema: z.object({
    jobId: z.string().describe("The job's unique identifier"),
    body: z.object({
    to: z.string().describe("Payment Additional Expense to").optional(),
    amount: z.number().describe("Amount of payment Additional Expense").optional(),
    // The API rejects the request outright without a paymentDate ("PaymentDate
    // cannot be null or empty"), so it is required here despite the spec
    // marking it nullable.
    paymentDate: z.iso.datetime().describe("An ISO 8601 string of the payment's datetime including the time component and ending with 'Z' (so in UTC), e.g. 2026-08-27T00:00:00Z. Note: Only the date is taken into account. The time component is discarded."),
    paymentMethod: z.string().max(50).describe("Payment method used to perform the payment, e.g. Credit Card").optional(),
    notes: z.string().max(250).describe("Optional note for the payment.").optional(),
    accountTypeId: z.string().describe("Id of account type").optional(),
    isPaid: z.boolean().describe("Value that indicates if the payment expense is fully paid.").optional(),
    refNumber: z.string().max(50).describe("Reference number for the payment expense.").optional()
  }),
  }),
  async call(client, { body, jobId }) {
    const res = await client.postCreatePaymentAdditionalExpense(body, { jobId });
    return res.data || { success: true, message: "Operation completed successfully." };
  },
});
