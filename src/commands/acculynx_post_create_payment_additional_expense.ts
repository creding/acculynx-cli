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
    notes: z.string().describe("Optional note for the payment.").optional(),
    accountTypeId: z.string().describe("Id of account type").optional(),
    isPaid: z.boolean().describe("Value that indicates if the payment expense is fully paid.").optional(),
    refNumber: z.string().describe("Reference number for the payment expense.").optional()
  }),
  }),
  async call(client, { body, jobId }) {
    const res = await client.postCreatePaymentAdditionalExpense(body, { jobId });
    return res.data || { success: true, message: "Operation completed successfully." };
  },
});
