import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { z } from "zod";
import { ResponseFormat } from "../lib/constants.ts";

export default defineAcculynxTool({
  description: "Report by instance Id",
  inputSchema: z.object({
    scheduledReportId: z.string().describe("The scheduled report's unique identifier"),
    instanceRunId: z.string().describe("The scheduled report's instance run unique identifier"),
    response_format: z.nativeEnum(ResponseFormat).optional().describe("Output serialization format"),
  }),
  async call(client, { scheduledReportId, instanceRunId }) {
    const res = await client.getReportByInstanceId({ scheduledReportId, instanceRunId });
    return res.data;
  },
});
