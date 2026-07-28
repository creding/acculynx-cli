import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { z } from "zod";
import { ResponseFormat } from "../lib/constants.ts";

export default defineAcculynxTool({
  description: "Extract production schedule assignments, work order references, and scheduled start/end dates for a job by inspecting its event history log.",
  inputSchema: z.object({
    jobId: z.string().guid().describe("Unique UUID string identifying the target job"),
    response_format: z.nativeEnum(ResponseFormat).optional().describe("Output serialization format"),
  }),
  async call(client, { jobId }) {
    const MAX_HISTORY_EVENTS = 50;
    const PAGE_SIZE = 25;
    const items: any[] = [];
    let recordStartIndex = 0;
    while (items.length < MAX_HISTORY_EVENTS) {
      const res = await client.getJobHistory({ jobId, pageSize: PAGE_SIZE, recordStartIndex });
      const pageItems = res.data?.items || [];
      if (pageItems.length === 0) break;
      items.push(...pageItems);
      recordStartIndex += pageItems.length;
      if (items.length >= MAX_HISTORY_EVENTS) break;
    }

    // Filter events related to production scheduling and work orders
    const scheduleEvents = items.filter((item: any) => {
      const text = (item?.action || "").toLowerCase();
      return text.includes("start date") || 
             text.includes("end date") || 
             text.includes("assignment changed") ||
             text.includes("order saved");
    });

    const outputData = {
      jobId,
      productionScheduleFound: scheduleEvents.length > 0,
      extractedScheduleEvents: scheduleEvents,
      recentHistoryContext: items.slice(0, 10), // provide baseline context
    };

    return outputData;
  },
});
