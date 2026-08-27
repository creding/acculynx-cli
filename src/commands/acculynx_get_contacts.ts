import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { z } from "zod";
import { ResponseFormat } from "../lib/constants.ts";

export default defineAcculynxTool({
  description: "List contacts or query via dynamic keyword matching, custom filtering, and standard sort ordering.",
  inputSchema: z.object({
    searchTerm: z.string().optional().describe("Filter contacts by first name, last name, or company name"),
    contactTypes: z.array(z.string()).optional().describe('Search mode only: restrict to these contact type names, e.g. ["Customer"]'),
    startDate: z.string().optional().describe("Search mode only: earliest creation date to match, ISO 8601 (defaults to 1970-01-01)"),
    endDate: z.string().optional().describe("Search mode only: latest creation date to match, ISO 8601 (defaults to 2050-01-01)"),
    sort: z
      .object({
        sortColumn: z.enum(["CreatedDate", "CompanyName", "ContactType", "firstName", "lastName", "LifeTimeValue"]).describe("The column to sort by"),
        sortDirection: z.enum(["Ascending", "Descending"]).describe("Sort direction of the search"),
      })
      .optional()
      .describe("Search mode only: sort order (defaults to lastName Ascending)"),
    pageSize: z.number().optional().describe("How many items to be returned at a time"),
    pageStartIndex: z.number().optional().describe("The index of the first element to return"),
    response_format: z.nativeEnum(ResponseFormat).optional().describe("Output format"),
  }),
  async call(client, { searchTerm, contactTypes, startDate, endDate, sort, pageSize, pageStartIndex }) {
    const pagination = { pageSize: pageSize ?? 25, pageStartIndex: pageStartIndex ?? 0 };
    if (searchTerm) {
      // Route search using standard search parameter object mapping
      const body: any = {
        searchTerm,
        startDate: startDate ?? "1970-01-01",
        endDate: endDate ?? "2050-01-01",
        sort: sort ?? {
          sortColumn: "lastName",
          sortDirection: "Ascending",
        },
      };
      if (contactTypes && contactTypes.length > 0) body.contactTypes = contactTypes;
      const res = await client.postContactSearch(body, pagination);
      return res.data;
    } else {
      // Fallback to standard contact listings
      const res = await client.getContacts(pagination);
      return res.data;
    }
  },
});
