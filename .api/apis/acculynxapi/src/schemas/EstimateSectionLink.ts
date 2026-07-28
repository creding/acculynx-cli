const EstimateSectionLink = {
  "type": "object",
  "title": "estimateSectionLink",
  "x-readme-ref-name": "estimateSectionLink",
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid",
      "description": "The unique identifier of the estimate section.",
      "examples": [
        "43bc3071-8701-4514-92d2-0ab6934bbacc"
      ]
    },
    "_link": {
      "type": "string",
      "description": "The unique URI of the Estimate Sction.",
      "examples": [
        "https://api.acculynx.com/api/v2/estimates/01a7cfc1-2231-4589-9657-7f3004c06bd3/sections/43bc3071-8701-4514-92d2-0ab6934bbacc"
      ]
    }
  }
} as const;
export default EstimateSectionLink
