import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { z } from "zod";
import { ResponseFormat } from "../lib/constants.ts";

export default defineAcculynxTool({
  description: "Retrieve a specific custom field for a job by id",
  inputSchema: z.object({
    jobId: z.string().describe("The job's unique identifier"),
    customFieldId: z.string().describe("The ID of the custom field"),
    response_format: z.nativeEnum(ResponseFormat).optional().describe("Output serialization format"),
  }),
  async call(client, { jobId, customFieldId }) {
    const res = await client.getJobCustomFieldById({ jobId, customFieldId });
    return res.data;
  },
});
