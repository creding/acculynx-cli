import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { z } from "zod";
import { ResponseFormat } from "../lib/constants.ts";

export default defineAcculynxTool({
  description: "Retrieve valid work type records and their corresponding identifiers.",
  inputSchema: z.object({
    pageSize: z.number().optional().describe("How many items to be returned at a time"),
    recordStartIndex: z.number().optional().describe("The index of the first element to return"),
    response_format: z.nativeEnum(ResponseFormat).optional().describe("Output formatting choice: markdown or json"),
  }),
  async call(client, { pageSize, recordStartIndex }) {
    const metadata: any = { pageSize: pageSize ?? 25 };
    if (recordStartIndex !== undefined) metadata.recordStartIndex = recordStartIndex;
    const res = await client.getCompanySettingsJobSettingsWorkTypes(metadata);
    return res.data;
  },
});
