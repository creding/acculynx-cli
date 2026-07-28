const ContactLogType = {
  "type": "string",
  "description": "The Contact Log Type",
  "enum": [
    "PhoneCall",
    "SMS",
    "Email"
  ],
  "title": "contactLogType",
  "x-readme-ref-name": "contactLogType",
  "examples": [
    "SMS"
  ]
} as const;
export default ContactLogType
