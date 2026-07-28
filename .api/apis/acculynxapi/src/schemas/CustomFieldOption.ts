const CustomFieldOption = {
  "type": "object",
  "title": "customFieldOption",
  "x-readme-ref-name": "customFieldOption",
  "properties": {
    "id": {
      "type": "string",
      "description": "The unique identifier of the custom field option.",
      "format": "uuid",
      "examples": [
        "a1b2c3d4-5e6f-7890-abcd-ef1234567890"
      ]
    },
    "value": {
      "type": "string",
      "description": "The value of the custom field option.",
      "examples": [
        "option_1"
      ]
    },
    "isActive": {
      "type": "boolean",
      "description": "Whether the custom field option is active.",
      "examples": [
        true
      ]
    },
    "sortOrder": {
      "type": "integer",
      "description": "The sort order of the custom field option.",
      "examples": [
        1
      ]
    }
  }
} as const;
export default CustomFieldOption
