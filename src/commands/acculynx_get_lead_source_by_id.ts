import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { z } from "zod";
import { ResponseFormat } from "../lib/constants.ts";

export default defineAcculynxTool({
  description: "Get Company Lead Source by Id.",
  inputSchema: z.object({
    leadSourceId: z.string().describe("The lead source's unique identifier"),
    response_format: z.nativeEnum(ResponseFormat).optional().describe("Output serialization format"),
  }),
  async call(client, { leadSourceId }) {
    const res = await client.getLeadSourceById({ leadSourceId });
    return res.data;
  },
});
