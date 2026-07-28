const JobInsuranceCompany = {
  "title": "jobInsuranceCompany",
  "x-readme-ref-name": "jobInsuranceCompany",
  "description": "An Insurance Company defined for this location. Insurance Companies can be managed on the web in the location's Account Settings.",
  "type": "object",
  "properties": {
    "id": {
      "description": "The unique Identifier for this Insurance Company.",
      "type": "string",
      "format": "uuid",
      "examples": [
        "89082e73-39fa-4082-b097-9cb1351da726"
      ]
    },
    "name": {
      "description": "The name of the Insurance Company.",
      "type": "string",
      "examples": [
        "Jim's Insurance"
      ]
    },
    "isActive": {
      "description": "Indicates if the insurance company is active or inactive.",
      "type": "boolean",
      "examples": [
        true
      ]
    }
  }
} as const;
export default JobInsuranceCompany
