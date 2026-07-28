import ContactAddress from './ContactAddress.js';

const ContactPut = {
  "type": "object",
  "properties": {
    "contactTypeIds": {
      "type": "array",
      "items": {
        "format": "uuid",
        "description": "Contact type unique identifier"
      },
      "minItems": 1
    },
    "firstName": {
      "type": [
        "string",
        "null"
      ],
      "description": "First name of the contact.",
      "minLength": 0,
      "maxLength": 50,
      "examples": [
        "John"
      ]
    },
    "lastName": {
      "type": [
        "string",
        "null"
      ],
      "description": "Last name of the contact.",
      "minLength": 0,
      "maxLength": 50,
      "examples": [
        "Smith"
      ]
    },
    "crossReference": {
      "type": [
        "string",
        "null"
      ],
      "description": "CrossReference of the contact.",
      "minLength": 0,
      "maxLength": 250,
      "examples": [
        "Cross reference."
      ]
    },
    "companyName": {
      "type": [
        "string",
        "null"
      ],
      "description": "Company name of the contact.",
      "minLength": 0,
      "maxLength": 100,
      "examples": [
        "Acme Roofing Inc."
      ]
    },
    "companyJobTitle": {
      "type": [
        "string",
        "null"
      ],
      "description": "Job title of the contact.",
      "examples": [
        "Job title"
      ]
    },
    "mailingAddress": ContactAddress,
    "billingAddress": ContactAddress,
    "billingAddressSameAsMailingAddress": {
      "type": "boolean",
      "description": "Indicates if the billing address is the same as mailing address",
      "examples": [
        false
      ]
    }
  },
  "required": [
    "contactTypeIds",
    "lastName"
  ],
  "title": "contactPut",
  "x-readme-ref-name": "contactPut",
  "$schema": "http://json-schema.org/draft-04/schema#"
} as const;
export default ContactPut
