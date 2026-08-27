import { defineAcculynxTool } from "../lib/define-acculynx-tool.ts";
import { always } from "../lib/approval.ts";
import { z } from "zod";

export default defineAcculynxTool({
  description: "Create Worksheet Item This mutates AccuLynx data and requires explicit human approval before it executes.",
  approval: always(),
  inputSchema: z.object({
    financialsId: z.string().describe("The Financial's unique identifier"),
    body: z.object({
    sectionId: z.string().describe("The unique ID of the worksheet section where the item will be created. If the worksheet does not exist, this field should be left empty.").optional(),
    parentItemId: z.string().describe("The unique ID for the parent item of this item.").optional(),
    itemName: z.string().max(28000).describe("The name of the item.").optional(),
    description: z.string().max(63000).describe("The description of the item.").optional(),
    quantity: z.number().describe("The quantity for this item.").optional(),
    unitOfMeasure: z.string().describe("The unique ID for the unit of measure.").optional(),
    costPerUnit: z.number().describe("The cost/unit for this item.").optional(),
    cost: z.number().describe("The cost for this item.").optional(),
    price: z.number().describe("The price for this item.")
  }),
  }),
  async call(client, { body, financialsId }) {
    const res = await client.postWorksheetSectionItem(body, { financialsId });
    return res.data || { success: true, message: "Operation completed successfully." };
  },
});
