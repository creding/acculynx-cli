import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { z } from "zod";
import { ResponseFormat } from "../lib/constants.ts";

export default defineAcculynxTool({
  description: "Get a list of instance runs for a Report Schedule Id",
  inputSchema: z.object({
    scheduledReportId: z.string().describe("The scheduled report's unique identifier"),
    pageSize: z.number().describe("How many items to be returned at a time.").optional(),
    pageStartIndex: z.number().describe("The index of the page to return").optional(),
    response_format: z.nativeEnum(ResponseFormat).optional().describe("Output serialization format"),
  }),
  async call(client, { scheduledReportId, pageSize, pageStartIndex }) {
    const res = await client.getReportsByInstanceInstanceRunsByScheduleId({ scheduledReportId, pageSize, pageStartIndex });
    return res.data;
  },
});
