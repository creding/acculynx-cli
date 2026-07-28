const EmailAddressPost = {
  "title": "emailAddressPost",
  "x-readme-ref-name": "emailAddressPost",
  "type": "object",
  "required": [
    "type",
    "address"
  ],
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
    },
    "address": {
      "type": "string",
      "format": "email",
      "description": "Contact email address",
      "examples": [
        "contactmail@mail.com"
      ]
    },
    "primary": {
      "type": "boolean",
      "description": "Is this the primary email address for this contact?",
      "readOnly": true
    },
    "type": {
      "description": "The type or classification of the email address. Determines the primary use case for this contact method.",
      "type": "string",
      "enum": [
        "Personal",
        "Work",
        "Other"
      ],
      "default": "Personal",
      "examples": [
        "Personal"
      ]
    }
  },
  "$schema": "http://json-schema.org/draft-04/schema#"
} as const;
export default EmailAddressPost
