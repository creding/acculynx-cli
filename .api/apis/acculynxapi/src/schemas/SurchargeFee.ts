const SurchargeFee = {
  "type": "object",
  "title": "surchargeFee",
  "x-readme-ref-name": "surchargeFee",
  "properties": {
    "amount": {
      "type": "number",
      "format": "float",
      "description": "Amount of surcharge payment",
      "examples": [
        2
      ]
    },
    "percentage": {
      "type": "number",
      "format": "float",
      "description": "The surcharge rate applied as a percentage of the transaction amount.",
      "examples": [
        3
      ]
    },
    "description": {
      "type": "string",
      "description": "An optional label or note describing this surcharge.",
      "examples": [
        "Credit card surcharge"
      ]
    }
  }
} as const;
export default SurchargeFee
