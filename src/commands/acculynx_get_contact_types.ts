import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { z } from "zod";
import { ResponseFormat } from "../lib/constants.ts";

export default defineAcculynxTool({
  description: "Retrieve valid contact assignment categories (e.g. Customer, Subcontractor, Supplier) and their UUID identifiers (used as contactTypeIds when creating contacts).",
  inputSchema: z.object({
    pageSize: z.number().optional().describe("How many items to be returned at a time"),
    pageStartIndex: z.number().optional().describe("The index of the first element to return"),
    response_format: z.nativeEnum(ResponseFormat).optional().describe("Output format"),
  }),
  async call(client, { pageSize, pageStartIndex }) {
    const metadata: any = { pageSize: pageSize ?? 25, pageStartIndex: pageStartIndex ?? 0 };
    const res = await client.getContactTypes(metadata);
    return res.data;
  },
});
