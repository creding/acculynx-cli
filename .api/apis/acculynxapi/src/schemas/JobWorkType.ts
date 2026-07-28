const JobWorkType = {
  "type": "object",
  "required": [
    "id"
  ],
  "properties": {
    "id": {
      "type": "integer",
      "description": "The work type unique identifier.",
      "examples": [
        1
      ]
    }
  },
  "title": "jobWorkType",
  "x-readme-ref-name": "jobWorkType",
  "$schema": "http://json-schema.org/draft-04/schema#"
} as const;
export default JobWorkType
