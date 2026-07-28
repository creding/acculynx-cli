import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { z } from "zod";
import { ResponseFormat } from "../lib/constants.ts";

export default defineAcculynxTool({
  description: "Retrieve deep properties for a single Contact resource identified by its unique UUID.",
  inputSchema: z.object({
    contactId: z.string().guid().describe("Unique UUID of the contact record"),
    response_format: z.nativeEnum(ResponseFormat).optional().describe("Output format"),
  }),
  async call(client, { contactId }) {
    const res = await client.getContact({ contactId });
    return res.data;
  },
});
