const JobLeadSource = {
  "type": "object",
  "required": [
    "id"
  ],
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid",
      "description": "The unique identifier of the lead source. Must be a valid non-empty GUID belonging to the company.",
      "examples": [
        "123e4567-e89b-12d3-a456-426614174000"
      ]
    }
  },
  "title": "jobLeadSource",
  "x-readme-ref-name": "jobLeadSource",
  "$schema": "http://json-schema.org/draft-04/schema#"
} as const;
export default JobLeadSource
