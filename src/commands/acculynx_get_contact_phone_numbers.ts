import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { z } from "zod";
import { ResponseFormat } from "../lib/constants.ts";

export default defineAcculynxTool({
  description: "List all phone numbers recorded for a specific Contact by its UUID.",
  inputSchema: z.object({
    contactId: z.string().guid().describe("Unique UUID of the contact record"),
    response_format: z.nativeEnum(ResponseFormat).optional().describe("Output serialization format"),
  }),
  async call(client, { contactId }) {
    const res = await client.getContactPhoneNumber({ contactId });
    return res.data;
  },
});
