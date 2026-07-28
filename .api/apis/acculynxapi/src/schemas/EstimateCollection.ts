import EstimateLink from './EstimateLink.js';

const EstimateCollection = {
  "title": "estimateCollection",
  "x-readme-ref-name": "estimateCollection",
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
      "items": EstimateLink
    }
  },
  "$schema": "http://json-schema.org/draft-04/schema#"
} as const;
export default EstimateCollection
