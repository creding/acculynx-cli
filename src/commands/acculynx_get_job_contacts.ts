import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { z } from "zod";
import { ResponseFormat } from "../lib/constants.ts";

export default defineAcculynxTool({
  description: "List all Contact records associated with a specific Job (e.g. the primary customer and any additional related contacts) by its UUID.",
  inputSchema: z.object({
    jobId: z.string().guid().describe("Unique UUID string identifying the target job"),
    response_format: z.nativeEnum(ResponseFormat).optional().describe("Output serialization format"),
  }),
  async call(client, { jobId }) {
    const res = await client.getJobContacts({ jobId, includes: "contacts" });
    return res.data;
  },
});
