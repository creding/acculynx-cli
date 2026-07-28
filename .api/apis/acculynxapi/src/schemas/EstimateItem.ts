const EstimateItem = {
  "type": "object",
  "title": "estimateItem",
  "x-readme-ref-name": "estimateItem",
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid",
      "description": "The unique ID for the item.",
      "examples": [
        "79bd84ff-a16a-4358-b1de-be5071c0f19c"
      ]
    },
    "name": {
      "type": "string",
      "description": "The name of the item."
    },
    "overrideName": {
      "type": "string",
      "description": "A custom, overridden name for the estimate item."
    },
    "description": {
      "type": "string",
      "description": "Description of the estimate item."
    },
    "materialCost": {
      "type": "number",
      "description": "Cost for materials."
    },
    "laborCost": {
      "type": "number",
      "description": "Cost for labor."
    },
    "waste": {
      "type": "number",
      "description": "Any waste recorded for the item."
    },
    "estimateUnit": {
      "type": "string",
      "description": "The unit of measurement for the item.",
      "examples": [
        "SF"
      ]
    },
    "orderUnit": {
      "type": "string",
      "description": "The unit of measurement to be ordered.",
      "examples": [
        "EA"
      ]
    },
    "unitConversion": {
      "type": "number",
      "description": "A conversion between the estimate unit and the order unit.",
      "examples": [
        0.1
      ]
    },
    "selectedUnit": {
      "type": "number",
      "description": "Whether the item uses the estimate unit or order unit. Expected values: 1 - Order, 2 - Estimate.",
      "examples": [
        1
      ]
    },
    "type": {
      "type": "string",
      "description": "The type of item in the catalog.\n\n`SKU` `Product` `CustomSKU` `Labor` `SKUAndLabor`",
      "enum": [
        "SKU",
        "Product",
        "CustomSKU",
        "Labor",
        "SKUAndLabor"
      ]
    },
    "totalPrice": {
      "type": "number",
      "description": "The total price for the item."
    },
    "fixedPrice": {
      "type": "boolean",
      "description": "Whether the price for the item is fixed or calculated."
    },
    "price": {
      "type": "number",
      "description": "The price per unit of the item."
    },
    "quantity": {
      "type": "number",
      "description": "The quantity of the item included in the estimate."
    },
    "measurementQuantity": {
      "type": "number",
      "description": "The measured quantity of the item."
    },
    "orderQuantity": {
      "type": "number",
      "description": "The ordered quantity of the item."
    },
    "_link": {
      "type": "string",
      "description": "The unique URI of the Estimate Item.",
      "examples": [
        "https://api.acculynx.com/api/v2/estimates/01a7cfc1-2231-4589-9657-7f3004c06bd3/sections/43bc3071-8701-4514-92d2-0ab6934bbacc/items/79bd84ff-a16a-4358-b1de-be5071c0f19c"
      ]
    }
  }
} as const;
export default EstimateItem
