const GetReportLatestInstance = {
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
          }
        },
        "required": [
          "scheduledReportId"
        ]
      }
    ]
  }
} as const;
export default GetReportLatestInstance
