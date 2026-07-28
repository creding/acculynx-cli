const GetAccuLynxStates = {
  "metadata": {
    "allOf": [
      {
        "$schema": "http://json-schema.org/draft-04/schema#",
        "type": "object",
        "properties": {
          "countryId": {
            "type": "string",
            "format": "integer",
            "description": "The country's identifier"
          }
        },
        "required": [
          "countryId"
        ]
      }
    ]
  }
} as const;
export default GetAccuLynxStates
