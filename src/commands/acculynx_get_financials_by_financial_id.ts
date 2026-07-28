import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { z } from "zod";
import { ResponseFormat } from "../lib/constants.ts";

export default defineAcculynxTool({
  description: "Get Financials",
  inputSchema: z.object({
    financialsId: z.string().describe("The Financial's unique identifier"),
    includes: z.enum(["amendments", "worksheet", "amendments worksheet"]).optional(),
    response_format: z.nativeEnum(ResponseFormat).optional().describe("Output serialization format"),
  }),
  async call(client, { financialsId, includes }) {
    const res = await client.getFinancialsByFinancialId({ financialsId, includes });
    return res.data;
  },
});
