import LeadAction from './LeadAction.js';

const LeadActionCollection = {
  "type": "object",
  "properties": {
    "items": {
      "type": "array",
      "items": LeadAction
    }
  },
  "title": "leadActionCollection",
  "x-readme-ref-name": "leadActionCollection",
  "$schema": "http://json-schema.org/draft-04/schema#"
} as const;
export default LeadActionCollection
