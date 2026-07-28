import JobContact from './JobContact.js';

const JobContactCollection = {
  "type": "object",
  "properties": {
    "items": {
      "type": "array",
      "items": JobContact
    }
  },
  "title": "jobContactCollection",
  "x-readme-ref-name": "jobContactCollection",
  "$schema": "http://json-schema.org/draft-04/schema#"
} as const;
export default JobContactCollection
