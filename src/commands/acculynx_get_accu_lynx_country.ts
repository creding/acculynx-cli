import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { z } from "zod";
import { ResponseFormat } from "../lib/constants.ts";

export default defineAcculynxTool({
  description: "Get an AccuLynx Country",
  inputSchema: z.object({
    countryId: z.string().describe("The country's identifier"),
    includes: z.string().describe("Optional fields to include in full with the response.").optional(),
    response_format: z.nativeEnum(ResponseFormat).optional().describe("Output serialization format"),
  }),
  async call(client, { countryId, includes }) {
    const res = await client.getAccuLynxCountry({ countryId, includes });
    return res.data;
  },
});
