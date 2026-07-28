import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { always } from "../lib/approval.ts";
import { z } from "zod";

export default defineAcculynxTool({
  description: "Update job trade types This mutates AccuLynx data and requires explicit human approval before it executes.",
  approval: always(),
  inputSchema: z.object({
    jobId: z.string().describe("The job's unique identifier"),
    body: z.object({
    items: z.array(z.object({
        id: z.string().describe("An unique identifier for the trade type.")
      })).optional()
  }),
  }),
  async call(client, { body, jobId }) {
    const res = await client.updateJobTradeTypes(body, { jobId });
    return res.data || { success: true, message: "Operation completed successfully." };
  },
});
