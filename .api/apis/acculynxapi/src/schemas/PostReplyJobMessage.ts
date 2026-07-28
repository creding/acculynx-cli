const PostReplyJobMessage = {
  "metadata": {
    "allOf": [
      {
        "$schema": "http://json-schema.org/draft-04/schema#",
        "type": "object",
        "properties": {
          "jobId": {
            "type": "string",
            "format": "uuid",
            "description": "The job's unique identifier"
          },
          "messageId": {
            "type": "string",
            "format": "uuid",
            "description": "The job message unique identifier"
          }
        },
        "required": [
          "jobId",
          "messageId"
        ]
      }
    ]
  },
  "response": {
    "429": {
      "type": "string",
      "$schema": "http://json-schema.org/draft-04/schema#"
    }
  }
} as const;
export default PostReplyJobMessage
