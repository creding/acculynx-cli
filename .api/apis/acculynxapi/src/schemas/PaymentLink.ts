const PaymentLink = {
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
    }
  },
  "title": "paymentLink",
  "x-readme-ref-name": "paymentLink",
  "$schema": "http://json-schema.org/draft-04/schema#"
} as const;
export default PaymentLink
