const ContactEmailAddress = {
  "type": "object",
  "properties": {
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
      "description": "Indicates if it is the primary email address",
      "examples": [
        true
      ]
    },
    "type": {
      "type": "string",
      "enum": [
        "Personal",
        "Work",
        "Other"
      ],
      "description": "The type of email"
    }
  },
  "title": "contactEmailAddress",
  "x-readme-ref-name": "contactEmailAddress"
} as const;
export default ContactEmailAddress
