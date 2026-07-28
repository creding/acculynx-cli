const GetJob = {
  "metadata": {
    "allOf": [
      {
        "$schema": "http://json-schema.org/draft-04/schema#",
        "type": "object",
        "properties": {
          "jobId": {
            "type": "string",
            "format": "uuid",
            "description": "The job's unique identifier"
          }
        },
        "required": [
          "jobId"
        ]
      },
      {
        "$schema": "http://json-schema.org/draft-04/schema#",
        "type": "object",
        "properties": {
          "includes": {
            "type": "string",
            "description": "Optional fields to include in full with the response."
          }
        }
      }
    ]
  }
} as const;
export default GetJob
