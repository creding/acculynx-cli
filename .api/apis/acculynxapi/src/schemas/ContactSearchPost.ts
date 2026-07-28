import ContactSort from './ContactSort.js';

const ContactSearchPost = {
  "type": "object",
  "properties": {
    "contactTypes": {
      "type": "array",
      "items": {
        "format": "string",
        "description": "Contact type name"
      }
    },
    "searchTerm": {
      "type": "string",
      "description": "It could be the first name, last name, company name of the contact.",
      "examples": [
        "John Smith"
      ]
    },
    "startDate": {
      "type": "string",
      "format": "date-time",
      "description": "An ISO 8601 string of the startDate to search. It will search by CreationDate. https://en.wikipedia.org/wiki/ISO_8601",
      "examples": [
        "2023-01-01T00:00:00Z"
      ]
    },
    "endDate": {
      "type": "string",
      "format": "date-time",
      "description": "An ISO 8601 string of the endDate to search It will search by CreationDate. https://en.wikipedia.org/wiki/ISO_8601",
      "examples": [
        "2023-06-30T23:59:59Z"
      ]
    },
    "sort": ContactSort
  },
  "required": [
    "startDate",
    "endDate",
    "sort"
  ],
  "title": "contactSearchPost",
  "x-readme-ref-name": "contactSearchPost",
  "$schema": "http://json-schema.org/draft-04/schema#"
} as const;
export default ContactSearchPost
