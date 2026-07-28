const ExternalReference = {
  "type": "object",
  "properties": {
    "jobId": {
      "type": "string",
      "format": "uuid",
      "description": "The unique ID for the job.",
      "examples": [
        "980783c8-7a34-4b20-a644-d6d94eff3b96"
      ]
    },
    "companyId": {
      "type": "string",
      "format": "uuid",
      "description": "The unique ID for the company.",
      "examples": [
        "980783c8-7a34-4b20-a644-d6d94eff3b96"
      ]
    },
    "source": {
      "type": "string",
      "description": "The source of the external reference",
      "examples": [
        "The external reference source"
      ]
    },
    "projectId": {
      "type": "string",
      "description": "The projectId of the external reference.",
      "examples": [
        "This is the projectId"
      ]
    }
  },
  "title": "externalReference",
  "x-readme-ref-name": "externalReference"
} as const;
export default ExternalReference
