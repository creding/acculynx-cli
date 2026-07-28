const GetAccountTypeById = {
  "metadata": {
    "allOf": [
      {
        "$schema": "http://json-schema.org/draft-04/schema#",
        "type": "object",
        "properties": {
          "accountTypeId": {
            "type": "string",
            "format": "uuid",
            "description": "The account type's unique identifier"
          }
        },
        "required": [
          "accountTypeId"
        ]
      }
    ]
  }
} as const;
export default GetAccountTypeById
