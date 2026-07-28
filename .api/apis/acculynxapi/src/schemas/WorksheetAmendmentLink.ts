const WorksheetAmendmentLink = {
  "type": "object",
  "title": "worksheetAmendmentLink",
  "x-readme-ref-name": "worksheetAmendmentLink",
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid",
      "description": "The unique identifier of the Amendment.",
      "examples": [
        "bf840f50-8a19-45d6-b6e8-86ad5db500af"
      ]
    },
    "_link": {
      "type": "string",
      "description": "The unique URI of the Amendment.",
      "examples": [
        "https://api.acculynx.com/api/v2/financials/01a7cfc1-2231-4589-9657-7f3004c06bd3/amendments/bf840f50-8a19-45d6-b6e8-86ad5db500af"
      ]
    }
  }
} as const;
export default WorksheetAmendmentLink
