import Address from './Address.js';
import EmailAddressLink from './EmailAddressLink.js';
import PhoneNumberLink from './PhoneNumberLink.js';

const ContactLink = {
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
    "phoneNumbers": {
      "items": PhoneNumberLink
    },
    "emailAddresses": {
      "items": EmailAddressLink
    },
    "mailingAddress": Address,
    "billingAddress": Address
  },
  "title": "contactLink",
  "x-readme-ref-name": "contactLink",
  "$schema": "http://json-schema.org/draft-04/schema#"
} as const;
export default ContactLink
