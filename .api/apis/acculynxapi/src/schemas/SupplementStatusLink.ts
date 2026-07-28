const SupplementStatusLink = {
  "type": "object",
  "title": "supplementStatusLink",
  "x-readme-ref-name": "supplementStatusLink",
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid",
      "description": "The supplement status unique identifier.",
      "examples": [
        "528806c3-c914-498a-80c7-59a98eb9bd44"
      ]
    },
    "_link": {
      "type": "string",
      "format": "uri",
      "description": "The URI of the Supplement Status.",
      "examples": [
        "https://api.acculynx.com/api/v2/company-settings/supplements/statuses/528806c3-c914-498a-80c7-59a98eb9bd44"
      ]
    }
  }
} as const;
export default SupplementStatusLink
