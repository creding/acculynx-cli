import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { z } from "zod";
import { ResponseFormat } from "../lib/constants.ts";

export default defineAcculynxTool({
  description: "Retrieve a list of job records, filter by pipeline milestones, or perform targeted keyword search.",
  inputSchema: z.object({
    searchTerm: z.string().optional().describe("Filter jobs matching specific street names, customer names, or numbers"),
    milestones: z.string().optional().describe("Comma-separated milestone filter (e.g. 'lead,prospect,approved')"),
    sortBy: z.enum(["CreatedDate", "MilestoneDate", "ModifiedDate"]).optional().describe("Sort the returned jobs by this date field (default CreatedDate)"),
    sortOrder: z.enum(["Ascending", "Descending"]).optional().describe("Return jobs in Ascending or Descending order (default Ascending)"),
    pageSize: z.number().optional().describe("How many items to be returned at a time"),
    recordStartIndex: z.number().optional().describe("The index of the first element to return"),
    startDate: z.string().optional().describe("Start date for the query, in YYYY-MM-DD format"),
    endDate: z.string().optional().describe("End date for the query, in YYYY-MM-DD format"),
    dateFilterType: z.enum(["CreatedDate", "MilestoneDate", "ModifiedDate"]).optional().describe("The date field to which startDate/endDate apply"),
    assignment: z.enum(["assigned", "unassigned"]).optional().describe("Filter assigned or unassigned jobs"),
    response_format: z.nativeEnum(ResponseFormat).optional().describe("Output serialization format"),
  }),
  async call(client, { searchTerm, milestones, sortBy, sortOrder, pageSize, recordStartIndex, startDate, endDate, dateFilterType, assignment }) {
    if (searchTerm) {
      // Route through global job search engine
      const searchMetadata: any = { includes: "contacts", pageSize: pageSize ?? 25 };
      if (recordStartIndex !== undefined) searchMetadata.recordStartIndex = recordStartIndex;
      const res = await client.searchJobs({ searchTerm }, searchMetadata);
      return res.data;
    } else {
      // Access standardized listing filtered by milestones if supplied
      const metadata: any = { includes: "contacts", pageSize: pageSize ?? 25 };
      if (milestones) {
        metadata.milestones = milestones;
      }
      if (sortBy) {
        metadata.sortBy = sortBy;
      }
      if (sortOrder) {
        metadata.sortOrder = sortOrder;
      }
      if (recordStartIndex !== undefined) {
        metadata.recordStartIndex = recordStartIndex;
      }
      if (startDate) {
        metadata.startDate = startDate;
      }
      if (endDate) {
        metadata.endDate = endDate;
      }
      if (dateFilterType) {
        metadata.dateFilterType = dateFilterType;
      }
      if (assignment) {
        metadata.assignment = assignment;
      }
      const res = await client.getJobs(metadata);
      return res.data;
    }
  },
});
