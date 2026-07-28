const GetEstimateSectionById = {
  "metadata": {
    "allOf": [
      {
        "$schema": "http://json-schema.org/draft-04/schema#",
        "type": "object",
        "properties": {
          "estimateId": {
            "type": "string",
            "format": "uuid",
            "description": "The estimate's unique identifier"
          },
          "estimateSectionId": {
            "type": "string",
            "format": "uuid",
            "description": "The estimate section's unique identifier"
          }
        },
        "required": [
          "estimateId",
          "estimateSectionId"
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
export default GetEstimateSectionById
