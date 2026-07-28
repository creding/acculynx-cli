const PutJobCustomFieldById = {
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
  },
  "response": {
    "429": {
      "type": "string",
      "$schema": "http://json-schema.org/draft-04/schema#"
    }
  }
} as const;
export default PutJobCustomFieldById
