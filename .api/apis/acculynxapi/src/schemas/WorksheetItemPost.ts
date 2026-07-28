const WorksheetItemPost = {
  "type": "object",
  "properties": {
    "sectionId": {
      "type": [
        "string",
        "null"
      ],
      "format": "uuid",
      "description": "The unique ID of the worksheet section where the item will be created. If the worksheet does not exist, this field should be left empty.",
      "examples": [
        "acbac5e9-3728-4d23-a902-1fefb639677e"
      ]
    },
    "parentItemId": {
      "type": [
        "string",
        "null"
      ],
      "format": "uuid",
      "description": "The unique ID for the parent item of this item.",
      "examples": [
        "3ba56c6b-6bcc-4f9c-857f-48b2f5a2f83c"
      ]
    },
    "itemName": {
      "type": [
        "string",
        "null"
      ],
      "description": "The name of the item.",
      "maxLength": 28000,
      "examples": [
        "Accident Debris Clean Up."
      ]
    },
    "description": {
      "type": [
        "string",
        "null"
      ],
      "description": "The description of the item.",
      "maxLength": 63000,
      "examples": [
        "Cleanup of all debris created when car crashed the house."
      ]
    },
    "quantity": {
      "type": [
        "integer",
        "null"
      ],
      "description": "The quantity for this item.",
      "examples": [
        5
      ]
    },
    "unitOfMeasure": {
      "type": [
        "string",
        "null"
      ],
      "format": "uuid",
      "description": "The unique ID for the unit of measure.",
      "examples": [
        "65d44fe6-a627-4ef4-a3a4-a948565e0309"
      ]
    },
    "costPerUnit": {
      "type": [
        "number",
        "null"
      ],
      "description": "The cost/unit for this item.",
      "examples": [
        2.35
      ]
    },
    "cost": {
      "type": [
        "number",
        "null"
      ],
      "description": "The cost for this item.",
      "examples": [
        1.55
      ]
    },
    "price": {
      "type": "number",
      "description": "The price for this item.",
      "examples": [
        5.55
      ]
    }
  },
  "required": [
    "price"
  ],
  "title": "worksheetItemPost",
  "x-readme-ref-name": "worksheetItemPost",
  "$schema": "http://json-schema.org/draft-04/schema#"
} as const;
export default WorksheetItemPost
