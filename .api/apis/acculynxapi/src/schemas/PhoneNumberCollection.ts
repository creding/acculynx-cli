import PhoneNumber from './PhoneNumber.js';

const PhoneNumberCollection = {
  "title": "phoneNumberCollection",
  "x-readme-ref-name": "phoneNumberCollection",
  "type": "object",
  "properties": {
    "items": {
      "type": "array",
      "items": PhoneNumber
    }
  },
  "$schema": "http://json-schema.org/draft-04/schema#"
} as const;
export default PhoneNumberCollection
