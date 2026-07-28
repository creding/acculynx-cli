const GetCompanyDocumentFolders = {
  "metadata": {
    "allOf": [
      {
        "$schema": "http://json-schema.org/draft-04/schema#",
        "type": "object",
        "properties": {
          "pageSize": {
            "type": "integer",
            "description": "How many items to be returned at a time."
          },
          "recordStartIndex": {
            "type": "integer",
            "default": 0,
            "description": "The index of the first element to return"
          },
          "sortOrder": {
            "type": "string",
            "enum": [
              "Ascending",
              "Descending"
            ],
            "default": "Ascending",
            "description": "return jobs in Ascending (default) or Descending order"
          }
        }
      }
    ]
  }
} as const;
export default GetCompanyDocumentFolders
