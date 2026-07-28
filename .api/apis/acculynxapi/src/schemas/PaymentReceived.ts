const PaymentReceived = {
  "type": "object",
  "required": [
    "amount"
  ],
  "properties": {
    "from": {
      "type": "string",
      "maxLength": 250,
      "description": "Party from which the payment was received (e.g., Customer Name)",
      "examples": [
        "Apex Roofing & Exteriors"
      ]
    },
    "amount": {
      "type": "number",
      "format": "decimal",
      "description": "The value of the received payment. Negative values are accepted (e.g., for adjustments).",
      "examples": [
        4250
      ]
    },
    "paymentDate": {
      "type": "string",
      "description": "Optional. An ISO 8601 string of the payment's datetime including the time component and ending with 'Z' (so in UTC). https://en.wikipedia.org/wiki/ISO_8601#Coordinated_Universal_Time_(UTC).  Only the date will be used, the time component will be ignored.",
      "examples": [
        "2020-06-22T18:47:10Z"
      ]
    },
    "paymentMethod": {
      "type": "string",
      "maxLength": 50,
      "description": "Payment method (e.g., Check, Credit Card, ACH, Wire)",
      "examples": [
        "Check"
      ]
    },
    "checkNumber": {
      "type": "string",
      "maxLength": 50,
      "description": "Reference number for the payment (e.g., Check Number, Transaction ID). Values exceeding 50 characters return a 400 validation error.",
      "examples": [
        "CHK-20482"
      ]
    },
    "notes": {
      "type": "string",
      "maxLength": 250,
      "description": "Any notes or memo about the payment.",
      "examples": [
        "Initial deposit for insurance claim repair"
      ]
    }
  },
  "title": "paymentReceived",
  "x-readme-ref-name": "paymentReceived",
  "$schema": "http://json-schema.org/draft-04/schema#"
} as const;
export default PaymentReceived
