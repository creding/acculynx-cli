const GetReportsRecipientsByInstanceId = {
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
          }
        },
        "required": [
          "scheduledReportId",
          "instanceRunId"
        ]
      },
      {
        "$schema": "http://json-schema.org/draft-04/schema#",
        "type": "object",
        "properties": {
          "pageSize": {
            "type": "integer",
            "description": "How many items to be returned at a time."
          },
          "pageStartIndex": {
            "type": "integer",
            "default": 0,
            "description": "The index of the page to return"
          }
        }
      }
    ]
  }
} as const;
export default GetReportsRecipientsByInstanceId
