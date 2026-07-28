const ContactPhoneNumber = {
  "type": "object",
  "required": [
    "number",
    "type"
  ],
  "properties": {
    "number": {
      "type": "string",
      "description": "10 digit phone number.",
      "minLength": 10,
      "maxLength": 10,
      "pattern": "^\\d{10}$",
      "examples": [
        "8555551234"
      ]
    },
    "ext": {
      "type": "string",
      "description": "Phone extension. Used for routing calls to a specific department or individual within the organization.",
      "examples": [
        "234"
      ]
    },
    "primary": {
      "type": "boolean",
      "description": "Indicates if it's the primary phone number",
      "examples": [
        true
      ]
    },
    "hasTextingAvailable": {
      "type": "boolean",
      "description": "Indicates whether SMS/text messaging is enabled for this phone number. When true, the contact can receive text messages at this number.",
      "examples": [
        true
      ]
    },
    "type": {
      "description": "The type or classification of the phone number. Determines the primary use case for this contact method.",
      "type": "string",
      "enum": [
        "Home",
        "Mobile",
        "Work"
      ],
      "default": "Home",
      "examples": [
        "Home"
      ]
    }
  },
  "title": "contactPhoneNumber",
  "x-readme-ref-name": "contactPhoneNumber"
} as const;
export default ContactPhoneNumber
