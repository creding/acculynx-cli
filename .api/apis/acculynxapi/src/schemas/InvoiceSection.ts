import InvoiceItem from './InvoiceItem.js';

const InvoiceSection = {
  "type": "object",
  "title": "invoiceSection",
  "x-readme-ref-name": "invoiceSection",
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid",
      "description": "The unique ID for the invoice section.",
      "examples": [
        "43bc3071-8701-4514-92d2-0ab6934bbacc"
      ]
    },
    "invoiceWorksheetSectionType": {
      "type": "string",
      "description": "An identifier for the type of invoice worksheet section.\n\n`Invoice` `Work Not Doing` `Supplements` `Discounts` `Upgrades` `Change Order` `Financial Worksheet` `Insurance Claim`",
      "enum": [
        "Invoice",
        "Work Not Doing",
        "Supplements",
        "Discounts",
        "Upgrades",
        "Change Order",
        "Financial Worksheet",
        "Insurance Claim"
      ],
      "examples": [
        "Invoice"
      ]
    },
    "totalPrice": {
      "type": "number",
      "description": "The total price of this invoice worksheet section."
    },
    "items": {
      "type": "array",
      "items": InvoiceItem
    }
  }
} as const;
export default InvoiceSection
