import ContactType from './ContactType.js';

const ContactTypesCollection = {
  "title": "contactTypesCollection",
  "x-readme-ref-name": "contactTypesCollection",
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
      "items": ContactType
    }
  },
  "$schema": "http://json-schema.org/draft-04/schema#"
} as const;
export default ContactTypesCollection
