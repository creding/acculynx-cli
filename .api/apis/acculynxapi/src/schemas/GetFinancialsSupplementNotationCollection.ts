const GetFinancialsSupplementNotationCollection = {
  "metadata": {
    "allOf": [
      {
        "$schema": "http://json-schema.org/draft-04/schema#",
        "type": "object",
        "properties": {
          "supplementId": {
            "type": "string",
            "format": "uuid",
            "description": "The supplement's unique identifier"
          }
        },
        "required": [
          "supplementId"
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
          }
        }
      }
    ]
  }
} as const;
export default GetFinancialsSupplementNotationCollection
