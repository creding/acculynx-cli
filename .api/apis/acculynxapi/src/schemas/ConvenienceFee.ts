const ConvenienceFee = {
  "type": "object",
  "title": "convenienceFee",
  "x-readme-ref-name": "convenienceFee",
  "properties": {
    "amount": {
      "type": "number",
      "format": "float",
      "description": "Amount of convenience fee",
      "examples": [
        2
      ]
    },
    "description": {
      "type": "string",
      "description": "Optional note for the convenience fee",
      "examples": [
        "Convenience fee note"
      ]
    },
    "source": {
      "type": "string",
      "description": "The payment method used to process this convenience fee (e.g., ACH, Credit Card).",
      "examples": [
        "ACH"
      ]
    }
  }
} as const;
export default ConvenienceFee
