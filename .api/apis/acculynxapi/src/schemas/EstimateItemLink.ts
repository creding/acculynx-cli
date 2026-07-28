const EstimateItemLink = {
  "type": "object",
  "title": "estimateItemLink",
  "x-readme-ref-name": "estimateItemLink",
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid",
      "description": "The unique identifier of the estimate item.",
      "examples": [
        "79bd84ff-a16a-4358-b1de-be5071c0f19c"
      ]
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
export default EstimateItemLink
