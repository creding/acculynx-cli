import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { always } from "../lib/approval.ts";
import { z } from "zod";

export default defineAcculynxTool({
  description: "Record a payment RECEIVED against a job (e.g. a customer check or deposit). This is a financial mutation and requires explicit human approval before it executes.",
  approval: always(),
  inputSchema: z.object({
    jobId: z.string().guid().describe("Unique UUID string identifying the target job"),
    amount: z.number().positive().describe("Payment amount in dollars"),
    paymentDate: z.string().describe("Date the payment was received, in YYYY-MM-DD format"),
    from: z.string().optional().describe("Who the payment was received from"),
    checkNumber: z.string().optional().describe("Reference or check number for the payment"),
    notes: z.string().optional().describe("Optional notes about the payment"),
  }),
  async call(client, { jobId, amount, paymentDate, from, checkNumber, notes }) {
    const body: any = { amount, paymentDate };
    if (from) body.from = from;
    if (checkNumber) body.checkNumber = checkNumber;
    if (notes) body.notes = notes;
    const res = await client.postCreatePaymentReceived(body, { jobId });
    return res.data || { success: true, message: "Payment recorded successfully." },
      undefined;
  },
});
