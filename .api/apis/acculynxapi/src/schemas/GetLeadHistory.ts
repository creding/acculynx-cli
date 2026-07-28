const GetLeadHistory = {
  "metadata": {
    "allOf": [
      {
        "$schema": "http://json-schema.org/draft-04/schema#",
        "type": "object",
        "properties": {
          "leadId": {
            "type": "string",
            "format": "uuid",
            "description": "The lead's unique identifier"
          }
        },
        "required": [
          "leadId"
        ]
      },
      {
        "$schema": "http://json-schema.org/draft-04/schema#",
        "type": "object",
        "properties": {
          "includes": {
            "type": "string",
            "description": "Optional fields to include in full with the response."
          }
        }
      }
    ]
  }
} as const;
export default GetLeadHistory
