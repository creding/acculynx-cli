import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { z } from "zod";
import { ResponseFormat } from "../lib/constants.ts";

export default defineAcculynxTool({
  description: "Get a particular state",
  inputSchema: z.object({
    countryId: z.string().describe("The country's identifier"),
    stateId: z.string().describe("The state's identifier."),
    response_format: z.nativeEnum(ResponseFormat).optional().describe("Output serialization format"),
  }),
  async call(client, { countryId, stateId }) {
    const res = await client.getAccuLynxState({ countryId, stateId });
    return res.data;
  },
});
