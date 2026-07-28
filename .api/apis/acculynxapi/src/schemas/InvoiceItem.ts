const InvoiceItem = {
  "type": "object",
  "title": "invoiceItem",
  "x-readme-ref-name": "invoiceItem",
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid",
      "description": "The unique ID for the item.",
      "examples": [
        "79bd84ff-a16a-4358-b1de-be5071c0f19c"
      ]
    },
    "itemName": {
      "type": "string",
      "description": "The name of the item."
    },
    "price": {
      "type": "number",
      "description": "The user entered price for this item."
    },
    "totalPrice": {
      "type": "number",
      "description": "Represents the contribution to the total of this invoice."
    },
    "parentItemId": {
      "type": "string",
      "description": "The unique ID for the parent item of this item.",
      "examples": [
        "79bd84ff-a16a-4358-b1de-be5071c0f19c"
      ]
    },
    "hierarchySortOrder": {
      "type": "number",
      "description": "The sort order of the item at the nested level it belongs to."
    },
    "lineItemAssignment": {
      "type": "string",
      "description": "The user entered account classification the line was assigned to."
    },
    "referenceId": {
      "type": "string",
      "format": "uuid",
      "description": "The unique ID for the Catalog reference.",
      "examples": [
        "cc16cfe4-28d9-4fe4-b281-0e24fc0b4d83"
      ]
    },
    "referenceType": {
      "type": "string",
      "description": "the reference type for the item.\n\n`SKU` `Product` `CustomeSKU` `Labor` `SKUAndLabor`",
      "enum": [
        "SKU",
        "Product",
        "CustomeSKU",
        "Labor",
        "SKUAndLabor"
      ],
      "examples": [
        "SKU"
      ]
    },
    "tradeId": {
      "type": "string",
      "format": "uuid",
      "description": "The unique ID for the trade of this item.",
      "examples": [
        "e8ea8f4c-14ca-4bdf-8fe6-882410316757"
      ]
    }
  }
} as const;
export default InvoiceItem
