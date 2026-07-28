const CustomFieldDefinition = {
  "type": "object",
  "title": "customFieldDefinition",
  "x-readme-ref-name": "customFieldDefinition",
  "properties": {
    "id": {
      "type": "string",
      "description": "The unique unique identifier of the AccuLynx custom field.",
      "format": "uuid",
      "examples": [
        "e5e7f960-f4c3-481d-93d3-0fc2b44efa41"
      ]
    },
    "_link": {
      "type": "string",
      "description": "The unique URI of the AccuLynx custom field.",
      "examples": [
        "https://api-acculynx.com/api/v2/company-settings/job-file-settings/custom-fields/e5e7f960-f4c3-481d-93d3-0fc2b44efa41"
      ]
    }
  }
} as const;
export default CustomFieldDefinition
