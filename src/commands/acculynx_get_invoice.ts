import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { z } from "zod";
import { ResponseFormat } from "../lib/constants.ts";

export default defineAcculynxTool({
  description: "Retrieve the full details of a single Invoice by its UUID. First obtain the invoice UUID from acculynx_get_job_invoices.",
  inputSchema: z.object({
    invoiceId: z.string().guid().describe("Unique UUID of the invoice (from acculynx_get_job_invoices)"),
    response_format: z.nativeEnum(ResponseFormat).optional().describe("Output serialization format"),
  }),
  async call(client, { invoiceId }) {
    const res = await client.getInvoiceById({ invoiceId });
    return res.data;
  },
});
