const GetContactPhoneNumber = {
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
  }
} as const;
export default GetContactPhoneNumber
