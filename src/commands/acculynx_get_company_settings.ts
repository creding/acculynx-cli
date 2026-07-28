import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { z } from "zod";
import { ResponseFormat } from "../lib/constants.ts";

export default defineAcculynxTool({
  description: "Retrieve top-level company settings and configuration (company profile and account-level preferences).",
  inputSchema: z.object({
    response_format: z.nativeEnum(ResponseFormat).optional().describe("Output serialization format"),
  }),
  async call(client) {
    const res = await client.getCompanySettings();
    return res.data;
  },
});
