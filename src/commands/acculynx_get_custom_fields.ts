import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { z } from "zod";
import { ResponseFormat } from "../lib/constants.ts";

export default defineAcculynxTool({
  description: "Retrieve company custom fields configuration to inspect valid options and IDs.",
  inputSchema: z.object({
    pageSize: z.number().optional().describe("How many items to be returned at a time"),
    recordStartIndex: z.number().optional().describe("The index of the first element to return"),
    filter: z.string().optional().describe("Filter custom fields by name or type"),
    includes: z.string().optional().describe("Optional fields to include in full with the response"),
    response_format: z.nativeEnum(ResponseFormat).optional().describe("Output formatting choice: markdown or json"),
  }),
  async call(client, { pageSize, recordStartIndex, filter, includes }) {
    const metadata: any = { pageSize: pageSize ?? 25 };
    if (recordStartIndex !== undefined) metadata.recordStartIndex = recordStartIndex;
    if (filter) metadata.filter = filter;
    if (includes) metadata.includes = includes;
    const res = await client.getCompanySettingsCustomFields(metadata);
    return res.data;
  },
});
