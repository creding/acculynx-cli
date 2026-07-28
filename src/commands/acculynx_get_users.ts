import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { z } from "zod";
import { ResponseFormat } from "../lib/constants.ts";

export default defineAcculynxTool({
  description: "Retrieve internal company user accounts for assigning estimators, sales owners, or representatives.",
  inputSchema: z.object({
    pageSize: z.number().optional().describe("How many items to be returned at a time"),
    recordStartIndex: z.number().optional().describe("The index of the first element to return"),
    status: z.string().optional().describe("Filter users by status (e.g. Active, Inactive, Archived, Deleted). Multiple values can be comma-separated."),
    response_format: z.nativeEnum(ResponseFormat).optional().describe("Output formatting choice: markdown or json"),
  }),
  async call(client, { pageSize, recordStartIndex, status }) {
    const metadata: any = { pageSize: pageSize ?? 25 };
    if (recordStartIndex !== undefined) metadata.recordStartIndex = recordStartIndex;
    if (status) metadata.status = status;
    const res = await client.getUsers(metadata);
    return res.data;
  },
});
