const CustomFieldBodyPut = {
  "required": [
    "id",
    "fieldType",
    "values"
  ],
  "type": "object",
  "title": "customFieldBodyPut",
  "x-readme-ref-name": "customFieldBodyPut",
  "properties": {
    "id": {
      "type": "string",
      "description": "The unique identifier of the AccuLynx custom field item.",
      "format": "uuid",
      "examples": [
        "228db892-3b49-4455-b839-ffd8576d8731"
      ]
    },
    "fieldType": {
      "type": "string",
      "enum": [
        "Text",
        "Number",
        "Date",
        "Boolean"
      ],
      "description": "Specifies the data type (text, number, date, boolean) for the custom field.",
      "examples": [
        "Text"
      ]
    },
    "values": {
      "type": "array",
      "examples": [
        "1",
        "2",
        "3"
      ],
      "items": {
        "type": "string",
        "examples": [
          "1"
        ]
      }
    }
  }
} as const;
export default CustomFieldBodyPut
