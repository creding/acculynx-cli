const WorksheetLink = {
  "type": "object",
  "title": "worksheetLink",
  "x-readme-ref-name": "worksheetLink",
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid",
      "description": "The unique identifier of the Worksheet.",
      "examples": [
        "01a7cfc1-2231-4589-9657-7f3004c06bd3"
      ]
    },
    "_link": {
      "type": "string",
      "description": "The unique URI of the Worksheet for the specified Job.",
      "examples": [
        "https://api.acculynx.com/api/v2/financials/01a7cfc1-2231-4589-9657-7f3004c06bd3/worksheet"
      ]
    }
  }
} as const;
export default WorksheetLink
