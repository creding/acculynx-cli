import ContactJob from './ContactJob.js';

const ContactJobCollection = {
  "title": "contactJobCollection",
  "x-readme-ref-name": "contactJobCollection",
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
      "description": "An array of jobs that the contact has been assigned to.\nEach item represents a job associated with the contact.\nThe array may be empty if no jobs exist within the requested range.\n",
      "items": ContactJob
    }
  },
  "$schema": "http://json-schema.org/draft-04/schema#"
} as const;
export default ContactJobCollection
