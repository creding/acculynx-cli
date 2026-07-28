import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { z } from "zod";
import { ResponseFormat } from "../lib/constants.ts";

export default defineAcculynxTool({
  description: "Get Company Child Lead Source by Id.",
  inputSchema: z.object({
    leadSourceId: z.string().describe("The lead source's unique identifier"),
    leadSourceParentId: z.string().describe("The parent lead source's unique identifier"),
    response_format: z.nativeEnum(ResponseFormat).optional().describe("Output serialization format"),
  }),
  async call(client, { leadSourceId, leadSourceParentId }) {
    const res = await client.getLeadSourceChildById({ leadSourceId, leadSourceParentId });
    return res.data;
  },
});
