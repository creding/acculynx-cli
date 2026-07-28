const SupplementItem = {
  "title": "supplementItem",
  "x-readme-ref-name": "supplementItem",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid",
      "description": "The supplement item unique identifier.",
      "examples": [
        "a646a794-4265-4b2b-bf01-1aa4afe127de"
      ]
    },
    "_link": {
      "type": "string",
      "format": "uri",
      "description": "The URI of the supplement item.",
      "examples": [
        "https://api.acculynx.com/api/v2/supplements/b195ca49-aeff-4e19-8ddd-193e01f5e649/items/a646a794-4265-4b2b-bf01-1aa4afe127de"
      ]
    },
    "name": {
      "type": "string",
      "description": "The name of the supplement item.",
      "examples": [
        "supplement item"
      ]
    },
    "description": {
      "type": "string",
      "description": "The supplement item description.",
      "examples": [
        ""
      ]
    },
    "originalClaimAmount": {
      "type": "number",
      "format": "float",
      "description": "Supplement item original claim amount.",
      "examples": [
        650.6
      ]
    },
    "requestedAmount": {
      "type": "number",
      "format": "float",
      "description": "Supplement item requested amount.",
      "examples": [
        1100.05
      ]
    },
    "approvedAmount": {
      "type": "number",
      "format": "float",
      "description": "Supplement item approved amount.",
      "examples": [
        1100.4
      ]
    },
    "appliedAmount": {
      "type": "number",
      "format": "float",
      "description": "Supplement item amount applied to Worksheet.",
      "examples": [
        900.48
      ]
    }
  }
} as const;
export default SupplementItem
