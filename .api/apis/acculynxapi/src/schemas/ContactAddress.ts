import ContactCountry from './ContactCountry.js';
import ContactState from './ContactState.js';

const ContactAddress = {
  "type": "object",
  "properties": {
    "street1": {
      "type": "string",
      "examples": [
        "123 Main St."
      ]
    },
    "street2": {
      "type": "string",
      "examples": [
        "Apt 2"
      ]
    },
    "city": {
      "type": "string",
      "examples": [
        "Peoria"
      ]
    },
    "zipCode": {
      "type": "string",
      "examples": [
        "61603"
      ]
    },
    "state": ContactState,
    "country": ContactCountry
  },
  "title": "contactAddress",
  "x-readme-ref-name": "contactAddress"
} as const;
export default ContactAddress
