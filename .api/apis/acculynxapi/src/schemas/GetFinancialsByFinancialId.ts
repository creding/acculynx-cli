const GetFinancialsByFinancialId = {
  "metadata": {
    "allOf": [
      {
        "$schema": "http://json-schema.org/draft-04/schema#",
        "type": "object",
        "properties": {
          "financialsId": {
            "type": "string",
            "format": "uuid",
            "description": "The Financial's unique identifier"
          }
        },
        "required": [
          "financialsId"
        ]
      },
      {
        "$schema": "http://json-schema.org/draft-04/schema#",
        "type": "object",
        "properties": {
          "includes": {
            "type": "string",
            "enum": [
              "amendments",
              "worksheet",
              "amendments worksheet"
            ],
            "description": "Optional fields to include in full with the response"
          }
        }
      }
    ]
  }
} as const;
export default GetFinancialsByFinancialId
