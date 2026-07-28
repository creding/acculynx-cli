const SearchJobs = {
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
          "includes": {
            "type": "string",
            "description": "Optional fields to include in full with the response."
          }
        }
      }
    ]
  }
} as const;
export default SearchJobs
