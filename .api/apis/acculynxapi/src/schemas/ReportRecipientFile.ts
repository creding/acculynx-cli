const ReportRecipientFile = {
  "type": "object",
  "title": "reportRecipientFile",
  "x-readme-ref-name": "reportRecipientFile",
  "properties": {
    "fileId": {
      "description": "The unique identifier of the file of a recipient of a given report instance.",
      "type": "string",
      "format": "uuid",
      "examples": [
        "bd110e4f-1b06-464c-b9cb-901d80ddc137"
      ]
    },
    "fileUrl": {
      "description": "The unique URI of the file of a recipient of a given report instance.",
      "type": "string",
      "format": "uri",
      "examples": [
        "https://assets.acculynx.com/scheduledReports/reports/d8afe5c0-b2ad-46f5-b9a1-0c6e966632c9/reports/db672560-00f0-405d-af6e-8d0aa17a94df.csv"
      ]
    }
  }
} as const;
export default ReportRecipientFile
