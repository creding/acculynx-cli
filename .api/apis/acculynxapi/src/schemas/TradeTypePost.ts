const TradeTypePost = {
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid",
      "description": "The trade type unique identifier.",
      "examples": [
        "3fa85f64-5717-4562-b3fc-2c963f66afa6"
      ]
    }
  },
  "title": "tradeTypePost",
  "x-readme-ref-name": "tradeTypePost"
} as const;
export default TradeTypePost
