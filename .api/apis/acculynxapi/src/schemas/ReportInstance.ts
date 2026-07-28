const ReportInstance = {
  "type": "object",
  "title": "reportInstance",
  "x-readme-ref-name": "reportInstance",
  "properties": {
    "reportId": {
      "description": "The unique identifier of the report instance.",
      "type": "string",
      "examples": [
        "db672560-00f0-405d-af6e-8d0aa17a94df"
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
    "runInstanceId": {
      "description": "The unique identifier of Report Recipient Instance.",
      "type": "string",
      "format": "uuid",
      "examples": [
        "be6f252d-5aa6-49e3-a2e2-470a67f88711"
      ]
    },
    "recipientsCount": {
      "description": "The amount of recipients within the scheduled report instance",
      "type": "integer",
      "examples": [
        100
      ]
    }
  }
} as const;
export default ReportInstance
