import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { z } from "zod";
import { ResponseFormat } from "../lib/constants.ts";

export default defineAcculynxTool({
  description: "Get statuses for a milestone",
  inputSchema: z.object({
    milestone: z.string().describe("Include only status currently in one of the listed milestone. Only one value is allowed. Possible values: lead, prospect, approved, completed, invoiced, closed, cancelled"),
    response_format: z.nativeEnum(ResponseFormat).optional().describe("Output serialization format"),
  }),
  async call(client, { milestone }) {
    const res = await client.getStatusesForMilestone({ milestone });
    return res.data;
  },
});
