import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { always } from "../lib/approval.ts";
import { z } from "zod";

export default defineAcculynxTool({
  description:
    "Update the lead source for a specified job. The lead source must be a valid GUID belonging to the company (discover valid IDs with acculynx_get_lead_sources). This mutates the job and requires explicit human approval before it executes.",
  approval: always(),
  inputSchema: z.object({
    jobId: z.string().guid().describe("Unique UUID string identifying the target job"),
    leadSourceId: z
      .string()
      .guid()
      .describe(
        "Unique UUID of the lead source to assign, obtained from acculynx_get_lead_sources. Must be a non-empty GUID belonging to the company.",
      ),
  }),
  async call(client, { jobId, leadSourceId }) {
    const res = await client.updateJobLeadSource({ id: leadSourceId }, { jobId });
    return res.data || { success: true, message: "Lead source updated successfully." },
      undefined;
  },
});
