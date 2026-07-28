const PutContact = {
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
export default PutContact
