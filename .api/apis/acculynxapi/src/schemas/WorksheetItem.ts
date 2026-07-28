const WorksheetItem = {
  "type": "object",
  "title": "worksheetItem",
  "x-readme-ref-name": "worksheetItem",
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid",
      "description": "The unique ID for the item.",
      "examples": [
        "79bd84ff-a16a-4358-b1de-be5071c0f19c"
      ]
    },
    "itemName": {
      "type": "string",
      "description": "The name of the item."
    },
    "price": {
      "type": "number",
      "description": "The user entered price for this item."
    },
    "totalPrice": {
      "type": "number",
      "description": "Represents the contribution to the total of this Worksheet."
    },
    "parentItemId": {
      "type": "string",
      "description": "The unique ID for the parent item of this item.",
      "examples": [
        "79bd84ff-a16a-4358-b1de-be5071c0f19c"
      ]
    },
    "hierarchySortOrder": {
      "type": "number",
      "description": "Represents the user set sort order defined on this Worksheet."
    },
    "tradeId": {
      "type": "string",
      "format": "uuid",
      "description": "The unique ID for the trade of this item.",
      "examples": [
        "e8ea8f4c-14ca-4bdf-8fe6-882410316757"
      ]
    }
  }
} as const;
export default WorksheetItem
