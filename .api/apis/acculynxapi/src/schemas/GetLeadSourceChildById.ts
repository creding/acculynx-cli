const GetLeadSourceChildById = {
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
          },
          "leadSourceParentId": {
            "type": "string",
            "format": "uuid",
            "description": "The parent lead source's unique identifier"
          }
        },
        "required": [
          "leadSourceId",
          "leadSourceParentId"
        ]
      }
    ]
  }
} as const;
export default GetLeadSourceChildById
