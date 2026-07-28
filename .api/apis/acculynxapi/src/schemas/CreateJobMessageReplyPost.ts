const CreateJobMessageReplyPost = {
  "type": "object",
  "properties": {
    "message": {
      "type": "string",
      "description": "The job message reply for a specific parent message",
      "examples": [
        "This is a message reply a specific parent message"
      ]
    }
  },
  "required": [
    "message"
  ],
  "title": "createJobMessageReplyPost",
  "x-readme-ref-name": "createJobMessageReplyPost",
  "$schema": "http://json-schema.org/draft-04/schema#"
} as const;
export default CreateJobMessageReplyPost
