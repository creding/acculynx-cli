const GetAccuLynxCountry = {
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
      },
      {
        "$schema": "http://json-schema.org/draft-04/schema#",
        "type": "object",
        "properties": {
          "includes": {
            "type": "string",
            "description": "Optional fields to include in full with the response."
          }
        }
      }
    ]
  }
} as const;
export default GetAccuLynxCountry
