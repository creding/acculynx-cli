const GetJobHistory = {
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
          "pageSize": {
            "type": "integer",
            "description": "How many items to be returned at a time."
          },
          "recordStartIndex": {
            "type": "integer",
            "default": 0,
            "description": "The index of the first element to return"
          },
          "includes": {
            "type": "string",
            "description": "Optional fields to include in full with the response."
          },
          "startDate": {
            "type": "string",
            "format": "date",
            "description": "Start date for the query, in YYYY-MM-DD format."
          },
          "endDate": {
            "type": "string",
            "format": "date",
            "description": "End date for the query, in YYYY-MM-DD format."
          }
        }
      }
    ]
  }
} as const;
export default GetJobHistory
