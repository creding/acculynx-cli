const AdditionalExpense = {
  "title": "additionalExpense",
  "x-readme-ref-name": "additionalExpense",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid",
      "description": "The GUID of the payment.",
      "examples": [
        "68badf8c-ec30-4531-a357-ff57bf12717b"
      ]
    },
    "paymentType": {
      "type": "string",
      "description": "Indicates the category of this payment. One of: `Received Payment`, `Paid Payment`, or `Additional Expense`.",
      "examples": [
        "Received Payment"
      ]
    },
    "isParent": {
      "type": "boolean",
      "description": "Indicates whether this payment has sub-payments. `true` when one or more sub-payments exist; `false` otherwise.",
      "examples": [
        true
      ]
    },
    "parentId": {
      "type": [
        "string",
        "null"
      ],
      "format": "uuid",
      "description": "The unique identifier of the parent payment. Present only on sub-payments; `null` for top-level payments.",
      "examples": [
        "fd33bba2-cb19-4baa-b87c-47ee9e55d95e"
      ]
    },
    "lastEditedDate": {
      "type": "string",
      "format": "date-time",
      "description": "The date and time the payment was last modified, in UTC.",
      "readOnly": true,
      "examples": [
        "2025-05-28T10:10:00Z"
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
    "refNumber": {
      "type": "string",
      "description": "Reference number associated with the payment. Max 50 characters.",
      "examples": [
        "3423"
      ]
    },
    "isPaid": {
      "type": "boolean",
      "description": "Indicates whether the payment has been paid in full.",
      "examples": [
        false
      ]
    },
    "to": {
      "type": "string",
      "description": "The entity or person to whom the payment was made. Max 250 characters.",
      "examples": [
        "Company name"
      ]
    },
    "amount": {
      "type": "number",
      "format": "float",
      "description": "The signed transaction amount.",
      "examples": [
        100
      ]
    },
    "notes": {
      "type": "string",
      "description": "Optional memo or notes associated with the payment.",
      "examples": [
        "Building permit fee for storm damage repair"
      ]
    },
    "accountTypeId": {
      "type": "string",
      "format": "uuid",
      "description": "The unique identifier of the account type associated with this payment.",
      "examples": [
        "a646a794-4265-4b2b-bf01-1aa4afe127de"
      ]
    },
    "transactionDate": {
      "type": "string",
      "format": "date-time",
      "description": "The date of the transaction. The time component is always midnight UTC (e.g. 2026-05-01T00:00:00Z).",
      "examples": [
        "2026-05-01T00:00:00Z"
      ]
    }
  }
} as const;
export default AdditionalExpense
