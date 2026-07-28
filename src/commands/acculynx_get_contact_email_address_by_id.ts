import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { z } from "zod";
import { ResponseFormat } from "../lib/constants.ts";

export default defineAcculynxTool({
  description: "Get Email Address.",
  inputSchema: z.object({
    contactId: z.string().describe("The contact's unique identifier"),
    emailId: z.string().describe("The unique id of an email address"),
    response_format: z.nativeEnum(ResponseFormat).optional().describe("Output serialization format"),
  }),
  async call(client, { contactId, emailId }) {
    const res = await client.getContactEmailAddressById({ contactId, emailId });
    return res.data;
  },
});
