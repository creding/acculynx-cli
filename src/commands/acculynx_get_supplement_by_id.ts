import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { z } from "zod";
import { ResponseFormat } from "../lib/constants.ts";

export default defineAcculynxTool({
  description: "Get supplement by the given ID.",
  inputSchema: z.object({
    supplementId: z.string().describe("The supplement's unique identifier"),
    response_format: z.nativeEnum(ResponseFormat).optional().describe("Output serialization format"),
  }),
  async call(client, { supplementId }) {
    const res = await client.getSupplementById({ supplementId });
    return res.data;
  },
});
