import LeadSourceChild from './LeadSourceChild.js';

const LeadSource = {
  "title": "leadSource",
  "x-readme-ref-name": "leadSource",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid",
      "examples": [
        "be6f252d-5aa6-49e3-a2e2-470a67f88711"
      ]
    },
    "_link": {
      "type": "string",
      "description": "The URI of the LeadSource.",
      "examples": [
        "https://api.acculynx.com/api/v2/company-settings/leads/lead-sources/be6f252d-5aa6-49e3-a2e2-470a67f88711"
      ]
    },
    "name": {
      "type": "string",
      "examples": [
        "Door Hanger"
      ]
    },
    "children": {
      "type": [
        "array",
        "null"
      ],
      "items": LeadSourceChild
    }
  }
} as const;
export default LeadSource
