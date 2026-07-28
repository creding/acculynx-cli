const GetWorksheetAmendmentById = {
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
          },
          "financialsAmendmentId": {
            "type": "string",
            "format": "uuid",
            "description": "The Worksheet's Amendment's unique identifier"
          }
        },
        "required": [
          "financialsId",
          "financialsAmendmentId"
        ]
      }
    ]
  }
} as const;
export default GetWorksheetAmendmentById
