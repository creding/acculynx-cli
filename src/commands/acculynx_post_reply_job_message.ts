import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { always } from "../lib/approval.ts";
import { z } from "zod";

export default defineAcculynxTool({
  description: "Reply Job Message This mutates AccuLynx data and requires explicit human approval before it executes.",
  approval: always(),
  inputSchema: z.object({
    jobId: z.string().describe("The job's unique identifier"),
    messageId: z.string().describe("The job message unique identifier"),
    body: z.object({
    message: z.string().describe("The job message reply for a specific parent message")
  }),
  }),
  async call(client, { body, jobId, messageId }) {
    const res = await client.postReplyJobMessage(body, { jobId, messageId });
    return res.data || { success: true, message: "Operation completed successfully." };
  },
});
