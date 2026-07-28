import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { z } from "zod";
import { ResponseFormat } from "../lib/constants.ts";

export default defineAcculynxTool({
  description: "Retrieve deep structural details for a single Job record mapped by its unique UUID. Note: To extract production schedules and work orders, use the specialized acculynx_get_job_production_schedule tool.",
  inputSchema: z.object({
    jobId: z.string().guid().describe("Unique UUID string identifying the target job"),
    response_format: z.nativeEnum(ResponseFormat).optional().describe("Output serialization format"),
  }),
  async call(client, { jobId }) {
    const res = await client.getJob({ jobId, includes: "contacts" });
    return res.data;
  },
});
