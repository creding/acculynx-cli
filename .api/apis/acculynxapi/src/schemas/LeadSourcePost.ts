const LeadSourcePost = {
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid",
      "description": "Unique identifier of the lead source",
      "examples": [
        "be6f252d-5aa6-49e3-a2e2-470a67f88711"
      ]
    }
  },
  "required": [
    "id"
  ],
  "title": "leadSourcePost",
  "x-readme-ref-name": "leadSourcePost"
} as const;
export default LeadSourcePost
