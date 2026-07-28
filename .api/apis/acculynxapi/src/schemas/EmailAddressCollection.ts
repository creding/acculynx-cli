import EmailAddress from './EmailAddress.js';

const EmailAddressCollection = {
  "title": "emailAddressCollection",
  "x-readme-ref-name": "emailAddressCollection",
  "type": "object",
  "properties": {
    "items": {
      "type": "array",
      "items": EmailAddress
    }
  },
  "$schema": "http://json-schema.org/draft-04/schema#"
} as const;
export default EmailAddressCollection
