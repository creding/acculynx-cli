const ContactType = {
  "type": "object",
  "title": "contactType",
  "x-readme-ref-name": "contactType",
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid",
      "description": "The unique identifier of the contact type.",
      "examples": [
        "67cdb4fd-5273-450c-b0a2-c77126800ba5"
      ]
    },
    "name": {
      "type": "string",
      "description": "The unique identifier of the contact type.",
      "examples": [
        "Customer"
      ]
    },
    "isDefault": {
      "type": "boolean",
      "description": "Indicates if the type is a default value or not",
      "examples": [
        true
      ]
    }
  }
} as const;
export default ContactType
