const TradeType = {
  "type": "object",
  "title": "tradeType",
  "x-readme-ref-name": "tradeType",
  "properties": {
    "tradeId": {
      "type": "string",
      "format": "uuid",
      "examples": [
        "3fa85f64-5717-4562-b3fc-2c963f66afa6"
      ]
    },
    "name": {
      "description": "The name of the Trade.",
      "type": "string",
      "examples": [
        "Windows"
      ]
    }
  }
} as const;
export default TradeType
