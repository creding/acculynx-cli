import Contact from './Contact.js';

const ContactCollection = {
  "title": "contactCollection",
  "x-readme-ref-name": "contactCollection",
  "type": "object",
  "properties": {
    "count": {
      "type": "integer",
      "description": "The total number of unfiltered items."
    },
    "pageSize": {
      "type": "integer",
      "description": "The requested or default page size."
    },
    "pageStartIndex": {
      "type": "integer",
      "description": "The requested or default index of the first element to return."
    },
    "items": {
      "type": "array",
      "items": Contact
    }
  },
  "$schema": "http://json-schema.org/draft-04/schema#"
} as const;
export default ContactCollection
