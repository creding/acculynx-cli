import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { z } from "zod";
import { ResponseFormat } from "../lib/constants.ts";

export default defineAcculynxTool({
  description: "Get a list of recipients for a specific instance of a Report Schedule Id",
  inputSchema: z.object({
    scheduledReportId: z.string().describe("The scheduled report's unique identifier"),
    instanceRunId: z.string().describe("The scheduled report's instance run unique identifier"),
    pageSize: z.number().describe("How many items to be returned at a time.").optional(),
    pageStartIndex: z.number().describe("The index of the page to return").optional(),
    response_format: z.nativeEnum(ResponseFormat).optional().describe("Output serialization format"),
  }),
  async call(client, { scheduledReportId, instanceRunId, pageSize, pageStartIndex }) {
    const res = await client.getReportsRecipientsByInstanceId({ scheduledReportId, instanceRunId, pageSize, pageStartIndex });
    return res.data;
  },
});
