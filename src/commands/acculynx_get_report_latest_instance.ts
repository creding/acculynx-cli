import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { z } from "zod";
import { ResponseFormat } from "../lib/constants.ts";

export default defineAcculynxTool({
  description: "Report get latest instance",
  inputSchema: z.object({
    scheduledReportId: z.string().describe("The scheduled report's unique identifier"),
    response_format: z.nativeEnum(ResponseFormat).optional().describe("Output serialization format"),
  }),
  async call(client, { scheduledReportId }) {
    const res = await client.getReportLatestInstance({ scheduledReportId });
    return res.data;
  },
});
