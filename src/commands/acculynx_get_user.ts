import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { z } from "zod";
import { ResponseFormat } from "../lib/constants.ts";

export default defineAcculynxTool({
  description: "Retrieve details for a single internal company user by their UUID. Obtain the userId from acculynx_get_users.",
  inputSchema: z.object({
    userId: z.string().guid().describe("Unique UUID of the user (from acculynx_get_users)"),
    response_format: z.nativeEnum(ResponseFormat).optional().describe("Output serialization format"),
  }),
  async call(client, { userId }) {
    const res = await client.getUser({ userId });
    return res.data;
  },
});
