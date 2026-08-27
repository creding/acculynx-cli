import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { always } from "../lib/approval.ts";
import { z } from "zod";

export default defineAcculynxTool({
  description: "Post a new message to a job's internal message thread. This writes visible content into the job record and requires explicit human approval before it executes.",
  approval: always(),
  inputSchema: z.object({
    jobId: z.string().guid().describe("Unique UUID string identifying the target job"),
    message: z.string().min(1).describe("The message body to post to the job thread"),
  }),
  async call(client, { jobId, message }) {
    const res = await client.postCreateJobMessage({ message }, { jobId });
    return res.data || { success: true, message: "Message posted successfully." };
  },
});
