import WorksheetSection from './WorksheetSection.js';

const WorksheetAmendment = {
  "title": "worksheetAmendment",
  "x-readme-ref-name": "worksheetAmendment",
  "type": "object",
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
    },
    "jobId": {
      "type": "string",
      "format": "uuid",
      "description": "The unique identifier of the Amendment.",
      "examples": [
        "01a7cfc1-2231-4589-9657-7f3004c06bd3"
      ]
    },
    "currentState": {
      "type": "string",
      "description": "The current state of the Amendment.",
      "examples": [
        "Approved"
      ]
    },
    "totalPrice": {
      "type": "number",
      "description": "The total price of the Amendment."
    },
    "title": {
      "type": "string",
      "description": "The title of the Amendment."
    },
    "createdDate": {
      "type": "string",
      "description": "The date/time the Amendment was created in UTC format.",
      "examples": [
        "2015-07-28T17:48:59Z"
      ]
    },
    "modifiedDate": {
      "type": "string",
      "description": "The date/time the Amendment was last modified in UTC format.",
      "examples": [
        "2015-08-01T12:05:03Z"
      ]
    },
    "sections": {
      "type": "array",
      "items": WorksheetSection
    }
  }
} as const;
export default WorksheetAmendment
