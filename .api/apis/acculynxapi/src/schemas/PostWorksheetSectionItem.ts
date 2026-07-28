const PostWorksheetSectionItem = {
  "metadata": {
    "allOf": [
      {
        "$schema": "http://json-schema.org/draft-04/schema#",
        "type": "object",
        "properties": {
          "financialsId": {
            "type": "string",
            "format": "uuid",
            "description": "The Financial's unique identifier"
          }
        },
        "required": [
          "financialsId"
        ]
      }
    ]
  },
  "response": {
    "429": {
      "type": "string",
      "$schema": "http://json-schema.org/draft-04/schema#"
    }
  }
} as const;
export default PostWorksheetSectionItem
