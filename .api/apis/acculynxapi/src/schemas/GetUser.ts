const GetUser = {
  "metadata": {
    "allOf": [
      {
        "$schema": "http://json-schema.org/draft-04/schema#",
        "type": "object",
        "properties": {
          "userId": {
            "type": "string",
            "format": "uuid",
            "description": "The user's unique identifier"
          }
        },
        "required": [
          "userId"
        ]
      }
    ]
  }
} as const;
export default GetUser
