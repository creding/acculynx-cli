import ConvenienceFee from './ConvenienceFee.js';
import ConvenienceFeeRefund from './ConvenienceFeeRefund.js';
import SurchargeFee from './SurchargeFee.js';

const ReceivedPayment = {
  "title": "receivedPayment",
  "x-readme-ref-name": "receivedPayment",
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
    "checkNumber": {
      "type": "string",
      "description": "The check or reference number associated with the payment. Max 50 characters.",
      "examples": [
        "3423"
      ]
    },
    "from": {
      "type": "string",
      "description": "The entity or person from whom the payment was received. Max 250 characters.",
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
        "Initial deposit for roof replacement"
      ]
    },
    "paymentDate": {
      "type": "string",
      "format": "date-time",
      "description": "The date the payment was received. The time component is always midnight UTC (e.g. 2022-06-22T00:00:00Z).",
      "examples": [
        "2022-06-22T00:00:00Z"
      ]
    },
    "surchargeFee": SurchargeFee,
    "convenienceFee": ConvenienceFee,
    "convenienceFeeRefund": ConvenienceFeeRefund,
    "system": {
      "type": "string",
      "description": "Read-only. Identifies the integration system associated with this payment. Known values: 'AccuPay', 'Sage Intacct', 'QuickBooks Online', 'QuickBooks Desktop'. When multiple systems are active, values are combined as a comma-separated string. Null when no integration system is associated.",
      "readOnly": true,
      "examples": [
        "AccuPay"
      ]
    }
  }
} as const;
export default ReceivedPayment
