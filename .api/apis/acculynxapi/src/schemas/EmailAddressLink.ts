const EmailAddressLink = {
  "type": "object",
  "title": "emailAddressLink",
  "x-readme-ref-name": "emailAddressLink",
  "properties": {
    "id": {
      "type": "string",
      "description": "The GUID of the Email Address.",
      "format": "uuid",
      "readOnly": true,
      "examples": [
        "40ac2713-13eb-4c69-8780-eee57fc71cba"
      ]
    },
    "_link": {
      "type": "string",
      "description": "The URI of the Email Address",
      "readOnly": true,
      "examples": [
        "https://api.acculynx.com/api/v2/contacts/d0b29a1b-6023-4a27-b028-25e85796c40b/email-addresses/40ac2713-13eb-4c69-8780-eee57fc71cba"
      ]
    }
  }
} as const;
export default EmailAddressLink
