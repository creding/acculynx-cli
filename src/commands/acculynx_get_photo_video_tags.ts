import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { z } from "zod";
import { ResponseFormat } from "../lib/constants.ts";

export default defineAcculynxTool({
  description: "Retrieve the configured photo/video tags available for categorizing job media files.",
  inputSchema: z.object({
    pageSize: z.number().optional().describe("How many items to be returned at a time"),
    recordStartIndex: z.number().optional().describe("The index of the first element to return"),
    sortOrder: z.enum(["Ascending", "Descending"]).optional().describe("Return tags in Ascending or Descending order"),
    response_format: z.nativeEnum(ResponseFormat).optional().describe("Output serialization format"),
  }),
  async call(client, { pageSize, recordStartIndex, sortOrder }) {
    const metadata: any = { pageSize: pageSize ?? 25 };
    if (recordStartIndex !== undefined) metadata.recordStartIndex = recordStartIndex;
    if (sortOrder) metadata.sortOrder = sortOrder;
    const res = await client.getPhotoVideoTags(metadata);
    return res.data;
  },
});
