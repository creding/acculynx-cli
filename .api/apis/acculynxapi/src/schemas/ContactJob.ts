const ContactJob = {
  "description": "A lightweight reference to a job associated with the contact, containing only the job ID and a link to the full job resource.",
  "title": "contactJob",
  "x-readme-ref-name": "contactJob",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid",
      "description": "The job's unique ID.",
      "examples": [
        "e591bf22-9828-4144-bca8-42cbb8c6e2c0"
      ]
    },
    "_link": {
      "type": "string",
      "description": "The URI of this Job.",
      "examples": [
        "https://api.acculynx.com/api/v2/jobs/e591bf22-9828-4144-bca8-42cbb8c6e2c0"
      ]
    }
  }
} as const;
export default ContactJob
