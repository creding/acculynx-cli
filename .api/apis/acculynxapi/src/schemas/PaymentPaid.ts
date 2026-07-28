const PaymentPaid = {
  "type": "object",
  "properties": {
    "to": {
      "type": "string",
      "description": "Payment paid to",
      "examples": [
        "John Doe"
      ]
    },
    "paymentMethod": {
      "type": "string",
      "maxLength": 50,
      "description": "Payment method used to perform the payment",
      "examples": [
        "Credit Card"
      ]
    },
    "amount": {
      "type": "number",
      "format": "float",
      "description": "Amount of payment paid",
      "examples": [
        5000
      ]
    },
    "paymentDate": {
      "type": "string",
      "format": "date-time",
      "description": "An ISO 8601 string of the payment's datetime including the time component and ending with 'Z' (so in UTC). Note: Only the date is taken into account. The time component is discarded. https://en.wikipedia.org/wiki/ISO_8601#Coordinated_Universal_Time_(UTC)",
      "examples": [
        "2020-06-22T00:00:00Z"
      ]
    },
    "notes": {
      "type": "string",
      "maxLength": 250,
      "description": "Optional note for the payment.",
      "examples": [
        "Note for the payment"
      ]
    },
    "accountTypeId": {
      "type": "string",
      "format": "uuid",
      "description": "Id of account type ",
      "examples": [
        "67f032b0-4780-40c3-b907-76635115b735"
      ]
    },
    "refNumber": {
      "type": "string",
      "maxLength": 50,
      "examples": [
        "AA11BB2233"
      ]
    },
    "isPaid": {
      "type": "boolean",
      "description": "Is Paid?"
    }
  },
  "required": [
    "amount"
  ],
  "title": "paymentPaid",
  "x-readme-ref-name": "paymentPaid",
  "$schema": "http://json-schema.org/draft-04/schema#"
} as const;
export default PaymentPaid
