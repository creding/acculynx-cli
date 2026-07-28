import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { z } from "zod";
import { ResponseFormat } from "../lib/constants.ts";

export default defineAcculynxTool({
  description: "Retrieve a specific custom field for a contact by id",
  inputSchema: z.object({
    contactId: z.string().describe("The contact's unique identifier"),
    customFieldId: z.string().describe("The ID of the custom field"),
    response_format: z.nativeEnum(ResponseFormat).optional().describe("Output serialization format"),
  }),
  async call(client, { contactId, customFieldId }) {
    const res = await client.getContactCustomFieldById({ contactId, customFieldId });
    return res.data;
  },
});
