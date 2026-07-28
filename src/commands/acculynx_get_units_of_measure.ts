import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { z } from "zod";
import { ResponseFormat } from "../lib/constants.ts";

export default defineAcculynxTool({
  description: "Retrieve the list of units of measure supported by AccuLynx (used in estimates and worksheets).",
  inputSchema: z.object({
    response_format: z.nativeEnum(ResponseFormat).optional().describe("Output serialization format"),
  }),
  async call(client) {
    const res = await client.getAccuLynxUnitsOfMeasure();
    return res.data;
  },
});
