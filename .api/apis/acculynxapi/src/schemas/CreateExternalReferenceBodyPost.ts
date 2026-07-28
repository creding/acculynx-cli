const CreateExternalReferenceBodyPost = {
  "type": "object",
  "properties": {
    "jobId": {
      "type": "string",
      "format": "uuid",
      "description": "The unique ID for the job (within Acculynx)",
      "examples": [
        "980783c8-7a34-4b20-a644-d6d94eff3b96"
      ]
    },
    "source": {
      "type": "string",
      "description": "The external source name",
      "examples": [
        "This is the source"
      ]
    },
    "projectId": {
      "type": "string",
      "description": "The project identifier within the external source",
      "examples": [
        "This is the project id"
      ]
    }
  },
  "required": [
    "jobId",
    "source",
    "projectId"
  ],
  "title": "createExternalReferenceBodyPost",
  "x-readme-ref-name": "createExternalReferenceBodyPost",
  "$schema": "http://json-schema.org/draft-04/schema#"
} as const;
export default CreateExternalReferenceBodyPost
