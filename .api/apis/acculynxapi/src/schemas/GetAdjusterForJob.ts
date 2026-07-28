const GetAdjusterForJob = {
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
      }
    ]
  }
} as const;
export default GetAdjusterForJob
