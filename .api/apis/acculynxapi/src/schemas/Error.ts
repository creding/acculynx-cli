const Error = {
  "type": "object",
  "properties": {
    "type": {
      "type": "string",
      "description": "The URI of an explanation of the error",
      "examples": [
        "https://tools.ietf.org/html/rfc7235#section-3.1"
      ]
    },
    "title": {
      "type": "string",
      "description": "Error description",
      "examples": [
        "This error happened."
      ]
    },
    "status": {
      "type": "number",
      "description": "HTTP status code",
      "examples": [
        400
      ]
    },
    "detail": {
      "type": "string",
      "description": "Any details available for this error",
      "examples": [
        "More info about this error."
      ]
    },
    "traceId": {
      "type": "string",
      "description": "An identifier that may be useful to AccuLynx support",
      "examples": [
        "|40f2a8f1-4db865dd47a69226."
      ]
    }
  },
  "required": [
    "type",
    "title",
    "status"
  ],
  "title": "error",
  "x-readme-ref-name": "error",
  "$schema": "http://json-schema.org/draft-04/schema#"
} as const;
export default Error
