const GetJobCustomFieldById = {
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
          "customFieldId": {
            "type": "string",
            "format": "uuid",
            "description": "The ID of the custom field"
          }
        },
        "required": [
          "jobId",
          "customFieldId"
        ]
      }
    ]
  }
} as const;
export default GetJobCustomFieldById
