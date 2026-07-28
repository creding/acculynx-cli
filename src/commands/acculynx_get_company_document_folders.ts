import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { z } from "zod";
import { ResponseFormat } from "../lib/constants.ts";

export default defineAcculynxTool({
  description: "Retrieve document folder categories and their unique IDs for file uploads.",
  inputSchema: z.object({
    pageSize: z.number().optional().describe("How many items to be returned at a time"),
    recordStartIndex: z.number().optional().describe("The index of the first element to return"),
    sortOrder: z.enum(["Ascending", "Descending"]).optional().describe("Return folders in Ascending or Descending order"),
    response_format: z.nativeEnum(ResponseFormat).optional().describe("Output formatting choice: markdown or json"),
  }),
  async call(client, { pageSize, recordStartIndex, sortOrder }) {
    const metadata: any = { pageSize: pageSize ?? 25 };
    if (recordStartIndex !== undefined) metadata.recordStartIndex = recordStartIndex;
    if (sortOrder) metadata.sortOrder = sortOrder;
    const res = await client.getCompanyDocumentFolders(metadata);
    return res.data;
  },
});
