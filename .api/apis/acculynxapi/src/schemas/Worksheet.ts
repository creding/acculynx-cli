import WorksheetSection from './WorksheetSection.js';

const Worksheet = {
  "title": "worksheet",
  "x-readme-ref-name": "worksheet",
  "type": "object",
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
    },
    "jobId": {
      "type": "string",
      "format": "uuid",
      "description": "The unique identifier of the Job this Worksheet is for.",
      "examples": [
        "01a7cfc1-2231-4589-9657-7f3004c06bd3"
      ]
    },
    "currentState": {
      "type": "string",
      "description": "The current state of the Worksheet.",
      "examples": [
        "Approved"
      ]
    },
    "totalPrice": {
      "type": "number",
      "description": "The total price of the Worksheet."
    },
    "title": {
      "type": "string",
      "description": "The title of the Worksheet."
    },
    "sections": {
      "type": "array",
      "items": WorksheetSection
    }
  },
  "$schema": "http://json-schema.org/draft-04/schema#"
} as const;
export default Worksheet
