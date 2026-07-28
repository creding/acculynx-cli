import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { z } from "zod";
import { ResponseFormat } from "../lib/constants.ts";

export default defineAcculynxTool({
  description: "Get Company States",
  inputSchema: z.object({
    countryId: z.string().describe("The country's identifier"),
    pageSize: z.number().describe("How many items to be returned at a time.").optional(),
    recordStartIndex: z.number().describe("The index of the first element to return").optional(),
    response_format: z.nativeEnum(ResponseFormat).optional().describe("Output serialization format"),
  }),
  async call(client, { countryId, pageSize, recordStartIndex }) {
    const res = await client.getcompanySettingsLocationSettingsCountriesCountryIdStates({ countryId, pageSize, recordStartIndex });
    return res.data;
  },
});
