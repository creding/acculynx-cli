const GetUsers = {
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
          "status": {
            "type": "string",
            "description": "Return users of the listed status.  Possible values are Active, Inactive, Archived, and Deleted. Multiple values are given comma seperated.  To return all users - Active,Inactive,Archive,Deleted.  When no status parameter is given, the Active users are returned."
          }
        }
      }
    ]
  }
} as const;
export default GetUsers
