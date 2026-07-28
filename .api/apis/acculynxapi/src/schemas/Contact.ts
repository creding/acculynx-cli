import Address from './Address.js';
import EmailAddressLink from './EmailAddressLink.js';
import PhoneNumberLink from './PhoneNumberLink.js';

const Contact = {
  "title": "contact",
  "x-readme-ref-name": "contact",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "The unique GUID identifying this contact.",
      "format": "uuid",
      "examples": [
        "61370abe-3534-4ba8-b2f2-2ff56cdd5e02"
      ]
    },
    "_link": {
      "type": "string",
      "description": "The unique URI for this resource.",
      "examples": [
        "https://api.acculynx.com/v2/contacts/61370abe-3534-4ba8-b2f2-2ff56cdd5e02"
      ]
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
    "salutation": {
      "type": "string",
      "description": "Salutation of the contact.",
      "examples": [
        "Mr."
      ]
    },
    "crossReference": {
      "type": "string",
      "description": "CrossReference of the contact."
    },
    "companyName": {
      "type": "string",
      "description": "CompanyName of the contact.",
      "examples": [
        "Acme Roofing Inc."
      ]
    },
    "phoneNumbers": {
      "type": "array",
      "items": PhoneNumberLink
    },
    "emailAddresses": {
      "type": "array",
      "items": EmailAddressLink
    },
    "mailingAddress": Address,
    "billingAddress": Address
  }
} as const;
export default Contact
