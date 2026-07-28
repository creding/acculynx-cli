const GetInvoicesForJob = {
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
          "pageStartIndex": {
            "type": "integer",
            "default": 0,
            "description": "The index of the page to return"
          },
          "sortOrder": {
            "type": "string",
            "enum": [
              "Ascending",
              "Descending"
            ],
            "default": "Ascending",
            "description": "return jobs in Ascending (default) or Descending order"
          }
        }
      }
    ]
  }
} as const;
export default GetInvoicesForJob
