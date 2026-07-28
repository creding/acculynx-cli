const GetEstimateSectionItem = {
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
          },
          "estimateItemId": {
            "type": "string",
            "format": "uuid",
            "description": "The estimate item's unique identifier"
          }
        },
        "required": [
          "estimateId",
          "estimateSectionId",
          "estimateItemId"
        ]
      }
    ]
  }
} as const;
export default GetEstimateSectionItem
