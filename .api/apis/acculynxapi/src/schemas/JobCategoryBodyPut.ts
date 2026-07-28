const JobCategoryBodyPut = {
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid",
      "description": "The unique identifier of the job category to set."
    }
  },
  "required": [
    "id"
  ],
  "title": "jobCategoryBodyPut",
  "x-readme-ref-name": "jobCategoryBodyPut",
  "$schema": "http://json-schema.org/draft-04/schema#"
} as const;
export default JobCategoryBodyPut
