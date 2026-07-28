import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { z } from "zod";
import { ResponseFormat } from "../lib/constants.ts";

export default defineAcculynxTool({
  description: "Retrieve the full details of a single appointment on a calendar. Obtain the calendarId and appointmentId from acculynx_get_appointments.",
  inputSchema: z.object({
    calendarId: z.string().describe("UUID of the calendar (from acculynx_get_calendars)"),
    appointmentId: z.string().describe("UUID of the appointment (from acculynx_get_appointments)"),
    response_format: z.nativeEnum(ResponseFormat).optional().describe("Output serialization format"),
  }),
  async call(client, { calendarId, appointmentId }) {
    const res = await client.getAppointmentById({ calendarId, appointmentId });
    return res.data;
  },
});
