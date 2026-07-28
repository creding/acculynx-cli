import JobTradeType from './JobTradeType.js';

const JobTradeTypeCollection = {
  "title": "jobTradeTypeCollection",
  "x-readme-ref-name": "jobTradeTypeCollection",
  "type": "object",
  "properties": {
    "items": {
      "type": "array",
      "items": JobTradeType
    }
  },
  "$schema": "http://json-schema.org/draft-04/schema#"
} as const;
export default JobTradeTypeCollection
