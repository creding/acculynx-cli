const PaymentAdditionalExpense = {
  "type": "object",
  "properties": {
    "to": {
      "type": "string",
      "description": "Payment Additional Expense to",
      "examples": [
        "John Doe"
      ]
    },
    "amount": {
      "type": "number",
      "format": "float",
      "description": "Amount of payment Additional Expense",
      "examples": [
        5000
      ]
    },
    "notes": {
      "type": "string",
      "description": "Optional note for the payment.",
      "examples": [
        "Note for the payment"
      ]
    },
    "accountTypeId": {
      "type": "string",
      "format": "uuid",
      "description": "Id of account type",
      "examples": [
        "a4cce567-43a9-434b-a146-256f1ad71ea5"
      ]
    },
    "isPaid": {
      "type": "boolean",
      "description": "Value that indicates if the payment expense is fully paid."
    },
    "refNumber": {
      "type": "string",
      "description": "Reference number for the payment expense.",
      "maxLength": 50,
      "examples": [
        "Ref-012345"
      ]
    },
    "paymentMethod": {
      "type": "string",
      "description": "Payment method used to perform the payment",
      "maxLength": 50,
      "examples": [
        "Credit Card"
      ]
    },
    "paymentDate": {
      "type": [
        "string",
        "null"
      ],
      "format": "date-time",
      "description": "An ISO 8601 string of the payment's datetime including the time component and ending with 'Z' (so in UTC). Note: Only the date is taken into account. The time component is discarded. https://en.wikipedia.org/wiki/ISO_8601#Coordinated_Universal_Time_(UTC)",
      "examples": [
        "2020-06-22T00:00:00Z"
      ]
    }
  },
  "title": "paymentAdditionalExpense",
  "x-readme-ref-name": "paymentAdditionalExpense",
  "$schema": "http://json-schema.org/draft-04/schema#"
} as const;
export default PaymentAdditionalExpense
