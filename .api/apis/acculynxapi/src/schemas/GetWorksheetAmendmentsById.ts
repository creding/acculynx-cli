const GetWorksheetAmendmentsById = {
  "metadata": {
    "allOf": [
      {
        "$schema": "http://json-schema.org/draft-04/schema#",
        "type": "object",
        "properties": {
          "financialsId": {
            "type": "string",
            "format": "uuid",
            "description": "The Financial's unique identifier"
          }
        },
        "required": [
          "financialsId"
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
export default GetWorksheetAmendmentsById
