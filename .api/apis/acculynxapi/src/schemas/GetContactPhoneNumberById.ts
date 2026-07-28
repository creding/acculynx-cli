const GetContactPhoneNumberById = {
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
          },
          "phoneId": {
            "type": "string",
            "format": "uuid",
            "description": "The unique id of a phone number"
          }
        },
        "required": [
          "contactId",
          "phoneId"
        ]
      }
    ]
  }
} as const;
export default GetContactPhoneNumberById
