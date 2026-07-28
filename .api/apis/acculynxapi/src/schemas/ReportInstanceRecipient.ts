import ReportRecipientFile from './ReportRecipientFile.js';

const ReportInstanceRecipient = {
  "type": "object",
  "title": "reportInstanceRecipient",
  "x-readme-ref-name": "reportInstanceRecipient",
  "properties": {
    "recipientId": {
      "description": "The unique identifier of the report's instance recipient.",
      "type": "string",
      "examples": [
        "5fafa5a5-74ad-4c31-8b33-005e16841d87"
      ]
    },
    "reportId": {
      "description": "The unique identifier of the report instance.",
      "type": "string",
      "examples": [
        "db672560-00f0-405d-af6e-8d0aa17a94df"
      ]
    },
    "runInstanceId": {
      "description": "The unique identifier of Report Recipient Instance.",
      "type": "string",
      "format": "uuid",
      "examples": [
        "be6f252d-5aa6-49e3-a2e2-470a67f88711"
      ]
    },
    "date": {
      "description": "The generation of the report date and time in ISO 8601. https://en.wikipedia.org/wiki/ISO_8601",
      "type": "string",
      "format": "date-time",
      "examples": [
        "2022-06-22T19:47:10Z"
      ]
    },
    "files": {
      "type": "array",
      "items": ReportRecipientFile
    }
  }
} as const;
export default ReportInstanceRecipient
