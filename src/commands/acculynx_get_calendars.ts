import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { z } from "zod";
import { ResponseFormat } from "../lib/constants.ts";

export default defineAcculynxTool({
  description: "List available company calendars and their UUIDs. Use a returned calendarId with acculynx_get_appointments to read scheduled appointments.",
  inputSchema: z.object({
    pageSize: z.number().optional().describe("How many items to be returned at a time"),
    recordStartIndex: z.number().optional().describe("The index of the first element to return"),
    response_format: z.nativeEnum(ResponseFormat).optional().describe("Output serialization format"),
  }),
  async call(client, { pageSize, recordStartIndex }) {
    const metadata: any = { pageSize: pageSize ?? 25 };
    if (recordStartIndex !== undefined) metadata.recordStartIndex = recordStartIndex;
    const res = await client.getCalendars(metadata);
    return res.data;
  },
});
