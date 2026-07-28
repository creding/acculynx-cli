const ContactId = {
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid",
      "description": "The unique identifier of the contact."
    }
  },
  "required": [
    "id"
  ],
  "title": "contactId",
  "x-readme-ref-name": "contactId"
} as const;
export default ContactId
