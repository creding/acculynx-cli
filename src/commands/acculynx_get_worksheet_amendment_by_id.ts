import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { z } from "zod";
import { ResponseFormat } from "../lib/constants.ts";

export default defineAcculynxTool({
  description: "Get Financial Amendment",
  inputSchema: z.object({
    financialsId: z.string().describe("The Financial's unique identifier"),
    financialsAmendmentId: z.string().describe("The Worksheet's Amendment's unique identifier"),
    response_format: z.nativeEnum(ResponseFormat).optional().describe("Output serialization format"),
  }),
  async call(client, { financialsId, financialsAmendmentId }) {
    const res = await client.getWorksheetAmendmentById({ financialsId, financialsAmendmentId });
    return res.data;
  },
});
