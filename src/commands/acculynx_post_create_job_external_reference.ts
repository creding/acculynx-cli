import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { always } from "../lib/approval.ts";
import { z } from "zod";

export default defineAcculynxTool({
  description: "Set an external reference for a job This mutates AccuLynx data and requires explicit human approval before it executes.",
  approval: always(),
  inputSchema: z.object({
    body: z.object({
    jobId: z.string().describe("The unique ID for the job (within Acculynx)"),
    source: z.string().describe("The external source name"),
    projectId: z.string().describe("The project identifier within the external source")
  }),
  }),
  async call(client, { body }) {
    const res = await client.postCreateJobExternalReference(body);
    return res.data || { success: true, message: "Operation completed successfully." };
  },
});
