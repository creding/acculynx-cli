const GetAccuLynxState = {
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
          },
          "stateId": {
            "type": "string",
            "format": "integer",
            "description": "The state's identifier."
          }
        },
        "required": [
          "countryId",
          "stateId"
        ]
      }
    ]
  }
} as const;
export default GetAccuLynxState
