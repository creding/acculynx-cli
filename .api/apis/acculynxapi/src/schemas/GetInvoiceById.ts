const GetInvoiceById = {
  "metadata": {
    "allOf": [
      {
        "$schema": "http://json-schema.org/draft-04/schema#",
        "type": "object",
        "properties": {
          "invoiceId": {
            "type": "string",
            "format": "uuid",
            "description": "The invoice's unique identifier"
          }
        },
        "required": [
          "invoiceId"
        ]
      }
    ]
  }
} as const;
export default GetInvoiceById
