const GetSupplementById = {
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
      }
    ]
  }
} as const;
export default GetSupplementById
