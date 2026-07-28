const JobMessage = {
  "type": "object",
  "properties": {
    "messageId": {
      "type": "string",
      "format": "uuid",
      "description": "Job message created unique identifier",
      "examples": [
        "c48d7485-b359-4b54-95a9-aec4a3bf8818"
      ]
    }
  },
  "title": "jobMessage",
  "x-readme-ref-name": "jobMessage",
  "$schema": "http://json-schema.org/draft-04/schema#"
} as const;
export default JobMessage
