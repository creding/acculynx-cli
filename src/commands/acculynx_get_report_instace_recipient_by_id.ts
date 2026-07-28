import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { z } from "zod";
import { ResponseFormat } from "../lib/constants.ts";

export default defineAcculynxTool({
  description: "Recipient of instance run by recipient Id",
  inputSchema: z.object({
    scheduledReportId: z.string().describe("The scheduled report's unique identifier"),
    instanceRunId: z.string().describe("The scheduled report's instance run unique identifier"),
    recipientId: z.string().describe("The scheduled report's recipient unique identifier of a given instance run"),
    response_format: z.nativeEnum(ResponseFormat).optional().describe("Output serialization format"),
  }),
  async call(client, { scheduledReportId, instanceRunId, recipientId }) {
    const res = await client.getReportInstaceRecipientById({ scheduledReportId, instanceRunId, recipientId });
    return res.data;
  },
});
