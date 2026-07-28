const GetWorksheetById = {
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
      }
    ]
  }
} as const;
export default GetWorksheetById
