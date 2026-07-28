import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { z } from "zod";
import { ResponseFormat } from "../lib/constants.ts";

export default defineAcculynxTool({
  description: "Retrieve the event history log for a specific Lead by its UUID (a Lead is a Job in the early pipeline stage; pass the job/lead UUID).",
  inputSchema: z.object({
    leadId: z.string().guid().describe("Unique UUID string identifying the target lead (same identifier as the job)"),
    response_format: z.nativeEnum(ResponseFormat).optional().describe("Output serialization format"),
  }),
  async call(client, { leadId }) {
    const res = await client.getLeadHistory({ leadId });
    return res.data;
  },
});
