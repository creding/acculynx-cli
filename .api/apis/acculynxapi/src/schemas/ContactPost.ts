import ContactAddress from './ContactAddress.js';
import ContactEmailAddress from './ContactEmailAddress.js';
import ContactPhoneNumber from './ContactPhoneNumber.js';

const ContactPost = {
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
      "type": "string",
      "description": "First name of the contact.",
      "examples": [
        "John"
      ]
    },
    "lastName": {
      "type": "string",
      "description": "Last name of the contact.",
      "examples": [
        "Smith"
      ]
    },
    "crossReference": {
      "type": "string",
      "description": "CrossReference of the contact.",
      "examples": [
        "Cross reference."
      ]
    },
    "companyName": {
      "type": "string",
      "description": "Company name of the contact.",
      "examples": [
        "Acme Roofing Inc."
      ]
    },
    "companyJobTitle": {
      "type": "string",
      "description": "Job title of the contact.",
      "examples": [
        "Job title"
      ]
    },
    "note": {
      "type": "string",
      "description": "A note for the contact.",
      "examples": [
        "This is a note"
      ]
    },
    "phoneNumbers": {
      "type": "array",
      "items": ContactPhoneNumber
    },
    "emailAddresses": {
      "type": "array",
      "items": ContactEmailAddress
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
  "title": "contactPost",
  "x-readme-ref-name": "contactPost",
  "$schema": "http://json-schema.org/draft-04/schema#"
} as const;
export default ContactPost
