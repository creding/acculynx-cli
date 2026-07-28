const GetReportInstaceRecipientById = {
  "metadata": {
    "allOf": [
      {
        "$schema": "http://json-schema.org/draft-04/schema#",
        "type": "object",
        "properties": {
          "scheduledReportId": {
            "type": "string",
            "format": "uuid",
            "description": "The scheduled report's unique identifier"
          },
          "instanceRunId": {
            "type": "string",
            "format": "uuid",
            "description": "The scheduled report's instance run unique identifier"
          },
          "recipientId": {
            "type": "string",
            "format": "uuid",
            "description": "The scheduled report's recipient unique identifier of a given instance run"
          }
        },
        "required": [
          "scheduledReportId",
          "instanceRunId",
          "recipientId"
        ]
      }
    ]
  }
} as const;
export default GetReportInstaceRecipientById
