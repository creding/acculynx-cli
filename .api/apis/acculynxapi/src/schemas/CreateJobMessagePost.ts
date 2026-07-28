const CreateJobMessagePost = {
  "type": "object",
  "properties": {
    "message": {
      "type": "string",
      "description": "The job message",
      "examples": [
        "This is a message for the job"
      ]
    }
  },
  "required": [
    "message"
  ],
  "title": "createJobMessagePost",
  "x-readme-ref-name": "createJobMessagePost",
  "$schema": "http://json-schema.org/draft-04/schema#"
} as const;
export default CreateJobMessagePost
