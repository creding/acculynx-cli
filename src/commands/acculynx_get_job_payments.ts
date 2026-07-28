import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { z } from "zod";
import { ResponseFormat } from "../lib/constants.ts";

export default defineAcculynxTool({
  description: "Retrieve payment log overviews, received funds, and outstanding liabilities linked to a specific job mapped by its unique UUID.",
  inputSchema: z.object({
    jobId: z.string().guid().describe("Unique UUID string identifying the target job"),
    response_format: z.nativeEnum(ResponseFormat).optional().describe("Output serialization format"),
  }),
  async call(client, { jobId }) {
    const res = await client.getPaymentsOverviewForJob({ jobId });
    return res.data;
  },
});
