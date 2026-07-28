import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { z } from "zod";
import { ResponseFormat } from "../lib/constants.ts";

export default defineAcculynxTool({
  description: "Get a phone number",
  inputSchema: z.object({
    contactId: z.string().describe("The contact's unique identifier"),
    phoneId: z.string().describe("The unique id of a phone number"),
    response_format: z.nativeEnum(ResponseFormat).optional().describe("Output serialization format"),
  }),
  async call(client, { contactId, phoneId }) {
    const res = await client.getContactPhoneNumberById({ contactId, phoneId });
    return res.data;
  },
});
