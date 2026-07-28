import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { z } from "zod";
import { ResponseFormat } from "../lib/constants.ts";

export default defineAcculynxTool({
  description: "Get Company Active Account Type by id.",
  inputSchema: z.object({
    accountTypeId: z.string().describe("The account type's unique identifier"),
    response_format: z.nativeEnum(ResponseFormat).optional().describe("Output serialization format"),
  }),
  async call(client, { accountTypeId }) {
    const res = await client.getAccountTypeById({ accountTypeId });
    return res.data;
  },
});
