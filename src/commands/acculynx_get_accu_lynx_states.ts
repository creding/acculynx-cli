import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { z } from "zod";
import { ResponseFormat } from "../lib/constants.ts";

export default defineAcculynxTool({
  description: "Get States",
  inputSchema: z.object({
    countryId: z.string().describe("The country's identifier"),
    response_format: z.nativeEnum(ResponseFormat).optional().describe("Output serialization format"),
  }),
  async call(client, { countryId }) {
    const res = await client.getAccuLynxStates({ countryId });
    return res.data;
  },
});
