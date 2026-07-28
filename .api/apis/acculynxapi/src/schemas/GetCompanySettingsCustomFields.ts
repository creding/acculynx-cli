const GetCompanySettingsCustomFields = {
  "metadata": {
    "allOf": [
      {
        "$schema": "http://json-schema.org/draft-04/schema#",
        "type": "object",
        "properties": {
          "filter": {
            "type": "string",
            "enum": [
              "jobs",
              "contacts"
            ],
            "description": "Filter custom field definitions by type. When not specified, returns both job and contact custom field definitions."
          },
          "pageSize": {
            "type": "integer",
            "description": "How many items to be returned at a time."
          },
          "recordStartIndex": {
            "type": "integer",
            "default": 0,
            "description": "The index of the first element to return"
          },
          "includes": {
            "type": "string",
            "description": "Optional fields to include in full with the response."
          }
        }
      }
    ]
  }
} as const;
export default GetCompanySettingsCustomFields
