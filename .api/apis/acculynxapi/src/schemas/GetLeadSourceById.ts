const GetLeadSourceById = {
  "metadata": {
    "allOf": [
      {
        "$schema": "http://json-schema.org/draft-04/schema#",
        "type": "object",
        "properties": {
          "leadSourceId": {
            "type": "string",
            "format": "uuid",
            "description": "The lead source's unique identifier"
          }
        },
        "required": [
          "leadSourceId"
        ]
      }
    ]
  }
} as const;
export default GetLeadSourceById
