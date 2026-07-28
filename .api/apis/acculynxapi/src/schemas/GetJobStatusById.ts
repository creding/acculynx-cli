const GetJobStatusById = {
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
          },
          "milestoneId": {
            "type": "string",
            "format": "uuid",
            "description": "The milestone unique identifier"
          },
          "statusId": {
            "type": "string",
            "format": "uuid",
            "description": "The status unique identifier"
          }
        },
        "required": [
          "jobId",
          "milestoneId",
          "statusId"
        ]
      }
    ]
  }
} as const;
export default GetJobStatusById
