const JobCategory = {
  "type": "object",
  "title": "jobCategory",
  "x-readme-ref-name": "jobCategory",
  "properties": {
    "id": {
      "type": "integer",
      "description": "The category's unique identifier.",
      "examples": [
        1
      ]
    },
    "name": {
      "type": "string",
      "description": "The category's name.",
      "examples": [
        "Residential"
      ]
    }
  }
} as const;
export default JobCategory
