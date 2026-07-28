const ConvenienceFeeRefund = {
  "type": "object",
  "title": "convenienceFeeRefund",
  "x-readme-ref-name": "convenienceFeeRefund",
  "properties": {
    "amount": {
      "type": "number",
      "format": "float",
      "description": "The refunded convenience fee amount.",
      "examples": [
        2
      ]
    },
    "description": {
      "type": "string",
      "description": "An optional label or note for this refund.",
      "examples": [
        "ACH convenience fee refund"
      ]
    },
    "date": {
      "type": "string",
      "format": "date-time",
      "description": "The date the convenience fee was refunded. The time component is always midnight UTC.",
      "examples": [
        "2025-07-14T00:00:00Z"
      ]
    }
  }
} as const;
export default ConvenienceFeeRefund
