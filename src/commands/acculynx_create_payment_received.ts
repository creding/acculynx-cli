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
    paymentMethod: z.string().max(50).optional().describe("Payment method used to perform the payment, e.g. Check or Credit Card"),
    from: z.string().max(250).optional().describe("Who the payment was received from"),
    checkNumber: z.string().max(50).optional().describe("Reference or check number for the payment"),
    notes: z.string().max(250).optional().describe("Optional notes about the payment"),
  }),
  async call(client, { jobId, amount, paymentDate, paymentMethod, from, checkNumber, notes }) {
    const body: any = { amount, paymentDate };
    if (paymentMethod) body.paymentMethod = paymentMethod;
    if (from) body.from = from;
    if (checkNumber) body.checkNumber = checkNumber;
    if (notes) body.notes = notes;
    const res = await client.postCreatePaymentReceived(body, { jobId });
    return res.data || { success: true, message: "Payment recorded successfully." };
  },
});
