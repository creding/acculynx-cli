import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { z } from "zod";
import { ResponseFormat } from "../lib/constants.ts";

export default defineAcculynxTool({
  description: "Retrieve all custom fields for a contact by id.",
  inputSchema: z.object({
    contactId: z.string().describe("The contact's unique identifier"),
    pageSize: z.number().describe("How many items to be returned at a time.").optional(),
    recordStartIndex: z.number().describe("The index of the first element to return").optional(),
    response_format: z.nativeEnum(ResponseFormat).optional().describe("Output serialization format"),
  }),
  async call(client, { contactId, pageSize, recordStartIndex }) {
    const res = await client.getContactCustomFields({ contactId, pageSize, recordStartIndex });
    return res.data;
  },
});
