import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { z } from "zod";
import { ResponseFormat } from "../lib/constants.ts";

export default defineAcculynxTool({
  description: "Get Job Payments",
  inputSchema: z.object({
    jobId: z.string().describe("The job's unique identifier"),
    response_format: z.nativeEnum(ResponseFormat).optional().describe("Output serialization format"),
  }),
  async call(client, { jobId }) {
    const res = await client.getPayments({ jobId });
    return res.data;
  },
});
