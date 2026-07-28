const WorkType = {
  "title": "workType",
  "x-readme-ref-name": "workType",
  "type": "object",
  "properties": {
    "id": {
      "type": "integer",
      "description": "The Work Type unique identifier.",
      "examples": [
        2
      ]
    },
    "_link": {
      "type": "string",
      "description": "The URI of the Work Type.",
      "examples": [
        "https://api.acculynx.com/api/v2/company-settings/job-file-settings/work-types/2"
      ]
    },
    "name": {
      "type": "string",
      "description": "The name of the Work Type.",
      "examples": [
        "Insurance"
      ]
    },
    "systemDefault": {
      "type": "boolean",
      "description": "Shows if the work type is a System Default item."
    }
  }
} as const;
export default WorkType
