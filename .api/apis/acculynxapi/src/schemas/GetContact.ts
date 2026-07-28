const GetContact = {
  "metadata": {
    "allOf": [
      {
        "$schema": "http://json-schema.org/draft-04/schema#",
        "type": "object",
        "properties": {
          "contactId": {
            "type": "string",
            "format": "uuid",
            "description": "The contact's unique identifier"
          }
        },
        "required": [
          "contactId"
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
export default GetContact
