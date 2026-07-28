import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { z } from "zod";
import { ResponseFormat } from "../lib/constants.ts";

export default defineAcculynxTool({
  description: "List contacts or query via dynamic keyword matching, custom filtering, and standard sort ordering.",
  inputSchema: z.object({
    searchTerm: z.string().optional().describe("Filter contacts by first name, last name, or company name"),
    pageSize: z.number().optional().describe("How many items to be returned at a time"),
    pageStartIndex: z.number().optional().describe("The index of the first element to return"),
    response_format: z.nativeEnum(ResponseFormat).optional().describe("Output format"),
  }),
  async call(client, { searchTerm, pageSize, pageStartIndex }) {
    const pagination = { pageSize: pageSize ?? 25, pageStartIndex: pageStartIndex ?? 0 };
    if (searchTerm) {
      // Route search using standard search parameter object mapping
      const res = await client.postContactSearch({
        searchTerm,
        startDate: "1970-01-01",
        endDate: "2050-01-01",
        sort: {
          sortColumn: "lastName",
          sortDirection: "Ascending",
        },
      }, pagination);
      return res.data;
    } else {
      // Fallback to standard contact listings
      const res = await client.getContacts(pagination);
      return res.data;
    }
  },
});
