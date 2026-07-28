const GetReportByInstanceId = {
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
      }
    ]
  }
} as const;
export default GetReportByInstanceId
