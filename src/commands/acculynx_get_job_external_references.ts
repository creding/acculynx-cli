import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { z } from "zod";
import { ResponseFormat } from "../lib/constants.ts";

export default defineAcculynxTool({
  description: "Retrieve external system reference identifiers (e.g. accounting or third-party integration IDs) linked to a Job for a given integration source.",
  inputSchema: z.object({
    jobId: z.string().guid().describe("Unique UUID string identifying the target job"),
    source: z.string().describe("The external integration source whose references should be returned (e.g. an accounting integration identifier)"),
    projectId: z.string().optional().describe("Optional external project identifier to scope the lookup"),
    response_format: z.nativeEnum(ResponseFormat).optional().describe("Output serialization format"),
  }),
  async call(client, { jobId, source, projectId }) {
    const metadata: any = { jobId, source };
    if (projectId) metadata.projectId = projectId;
    const res = await client.getJobExternalReferences(metadata);
    return res.data;
  },
});
