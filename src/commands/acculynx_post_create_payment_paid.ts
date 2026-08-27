import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { always } from "../lib/approval.ts";
import { z } from "zod";

export default defineAcculynxTool({
  description: "Create Payment Paid This mutates AccuLynx data and requires explicit human approval before it executes.",
  approval: always(),
  inputSchema: z.object({
    jobId: z.string().describe("The job's unique identifier"),
    body: z.object({
    to: z.string().describe("Payment paid to").optional(),
    paymentMethod: z.string().max(50).describe("Payment method used to perform the payment").optional(),
    amount: z.number().describe("Amount of payment paid").optional(),
    // Deliberately optional: the spec requires only `amount` here, and finding
    // out whether the API also mandates paymentDate means creating a payment
    // record there is no API to delete. If it is required, an omitted date
    // costs one clean 400 ("PaymentDate cannot be null or empty") and creates
    // nothing; requiring it on a guess would hard-block date-less calls.
    paymentDate: z.iso.datetime().describe("An ISO 8601 string of the payment's datetime including the time component and ending with 'Z' (so in UTC). Note: Only the date is taken into account. The time component is discarded. https://en.wikipedia.org/wiki/ISO_8601#Coordinated_Universal_Time_(UTC)").optional(),
    notes: z.string().max(250).describe("Optional note for the payment.").optional(),
    accountTypeId: z.string().describe("Id of account type").optional(),
    refNumber: z.string().max(50).optional(),
    isPaid: z.boolean().describe("Is Paid?").optional()
  }),
  }),
  async call(client, { body, jobId }) {
    const res = await client.postCreatePaymentPaid(body, { jobId });
    return res.data || { success: true, message: "Operation completed successfully." };
  },
});
