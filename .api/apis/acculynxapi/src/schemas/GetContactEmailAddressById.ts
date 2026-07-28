const GetContactEmailAddressById = {
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
          "emailId": {
            "type": "string",
            "format": "uuid",
            "description": "The unique id of an email address"
          }
        },
        "required": [
          "contactId",
          "emailId"
        ]
      }
    ]
  }
} as const;
export default GetContactEmailAddressById
