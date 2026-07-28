import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { z } from "zod";
import { ResponseFormat } from "../lib/constants.ts";

export default defineAcculynxTool({
  description: "Retrieve appointments scheduled within a date range on a specific calendar. Obtain the calendarId from acculynx_get_calendars.",
  inputSchema: z.object({
    calendarId: z.string().describe("UUID of the calendar (from acculynx_get_calendars)"),
    startDate: z.string().describe("Start of the appointment window in YYYY-MM-DD format"),
    endDate: z.string().describe("End of the appointment window in YYYY-MM-DD format"),
    pageSize: z.number().optional().describe("How many items to be returned at a time"),
    pageStartIndex: z.number().optional().describe("The index of the first element to return"),
    response_format: z.nativeEnum(ResponseFormat).optional().describe("Output serialization format"),
  }),
  async call(client, { calendarId, startDate, endDate, pageSize, pageStartIndex }) {
    const metadata: any = { calendarId, startDate, endDate, pageSize: pageSize ?? 25 };
    if (pageStartIndex !== undefined) metadata.pageStartIndex = pageStartIndex;
    const res = await client.getAppointments(metadata);
    return res.data;
  },
});
