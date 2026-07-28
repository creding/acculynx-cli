import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { z } from "zod";
import { ResponseFormat } from "../lib/constants.ts";

export default defineAcculynxTool({
  description: "Get a job contact by Id",
  inputSchema: z.object({
    jobId: z.string().describe("The job's unique identifier"),
    jobContactId: z.string().describe("The job contact's unique identifier"),
    includes: z.string().describe("Optional fields to include in full with the response.").optional(),
    response_format: z.nativeEnum(ResponseFormat).optional().describe("Output serialization format"),
  }),
  async call(client, { jobId, jobContactId, includes }) {
    const res = await client.getJobContact({ jobId, jobContactId, includes });
    return res.data;
  },
});
