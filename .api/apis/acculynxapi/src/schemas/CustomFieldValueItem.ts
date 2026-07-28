const CustomFieldValueItem = {
  "type": "object",
  "title": "customFieldValueItem",
  "x-readme-ref-name": "customFieldValueItem",
  "properties": {
    "id": {
      "type": "string",
      "description": "The unique identifier of the AccuLynx custom field item.",
      "format": "uuid",
      "examples": [
        "228db892-3b49-4455-b839-ffd8576d8731"
      ]
    },
    "value": {
      "type": "string",
      "description": "The item value of the custom field",
      "examples": [
        "White Roof"
      ]
    }
  }
} as const;
export default CustomFieldValueItem
