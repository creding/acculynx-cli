const GetEstimateSectionItems = {
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
      }
    ]
  }
} as const;
export default GetEstimateSectionItems
