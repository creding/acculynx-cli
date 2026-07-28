const GetContactCustomFieldById = {
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
          "customFieldId": {
            "type": "string",
            "format": "uuid",
            "description": "The ID of the custom field"
          }
        },
        "required": [
          "contactId",
          "customFieldId"
        ]
      }
    ]
  }
} as const;
export default GetContactCustomFieldById
