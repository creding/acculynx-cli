import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { z } from "zod";
import { ResponseFormat } from "../lib/constants.ts";

export default defineAcculynxTool({
  description: "Get Worksheet",
  inputSchema: z.object({
    financialsId: z.string().describe("The Financial's unique identifier"),
    response_format: z.nativeEnum(ResponseFormat).optional().describe("Output serialization format"),
  }),
  async call(client, { financialsId }) {
    const res = await client.getWorksheetById({ financialsId });
    return res.data;
  },
});
