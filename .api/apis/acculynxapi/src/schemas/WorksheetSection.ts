import WorksheetItem from './WorksheetItem.js';

const WorksheetSection = {
  "type": "object",
  "title": "worksheetSection",
  "x-readme-ref-name": "worksheetSection",
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid",
      "description": "The unique ID for the Worksheet section.",
      "examples": [
        "43bc3071-8701-4514-92d2-0ab6934bbacc"
      ]
    },
    "sectionType": {
      "type": "string",
      "description": "An identifier for the type of Worksheet section.\n\n`Invoice` `Work Not Doing` `Supplements` `Discounts` `Upgrades` `Change Order` `Worksheet` `Insurance Claim`",
      "enum": [
        "Invoice",
        "Work Not Doing",
        "Supplements",
        "Discounts",
        "Upgrades",
        "Change Order",
        "Worksheet",
        "Insurance Claim"
      ],
      "examples": [
        "Worksheet"
      ]
    },
    "totalPrice": {
      "type": "number",
      "description": "The total price of this Worksheet worksheet section."
    },
    "items": {
      "type": "array",
      "items": WorksheetItem
    }
  }
} as const;
export default WorksheetSection
