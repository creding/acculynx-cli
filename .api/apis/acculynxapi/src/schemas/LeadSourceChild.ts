const LeadSourceChild = {
  "type": "object",
  "title": "leadSourceChild",
  "x-readme-ref-name": "leadSourceChild",
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid",
      "examples": [
        "be6f252d-5aa6-49e3-a2e2-470a67f88711"
      ]
    },
    "name": {
      "type": "string",
      "examples": [
        "Child Lead Source"
      ]
    },
    "parentId": {
      "type": "string",
      "format": "uuid",
      "examples": [
        "f29b31a2-607e-4550-ab0b-8ff48f532253"
      ]
    },
    "_link": {
      "type": "string",
      "description": "The URI of the LeadSource.",
      "examples": [
        "https://api.acculynx.com/api/v2/company-settings/leads/lead-sources/f29b31a2-607e-4550-ab0b-8ff48f532253/children/be6f252d-5aa6-49e3-a2e2-470a67f88711"
      ]
    }
  }
} as const;
export default LeadSourceChild
