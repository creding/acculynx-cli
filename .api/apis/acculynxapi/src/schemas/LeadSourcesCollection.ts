import LeadSource from './LeadSource.js';

const LeadSourcesCollection = {
  "title": "leadSourcesCollection",
  "x-readme-ref-name": "leadSourcesCollection",
  "type": "object",
  "properties": {
    "count": {
      "type": "integer",
      "description": "The total number of unfiltered items.",
      "examples": [
        10
      ]
    },
    "pageSize": {
      "type": "integer",
      "description": "The requested or default page size.",
      "examples": [
        2
      ]
    },
    "pageStartIndex": {
      "type": "integer",
      "description": "The requested or default index of the first element to return."
    },
    "items": {
      "type": "array",
      "items": LeadSource
    }
  },
  "$schema": "http://json-schema.org/draft-04/schema#"
} as const;
export default LeadSourcesCollection
