import InvoiceSection from './InvoiceSection.js';

const Invoice = {
  "title": "invoice",
  "x-readme-ref-name": "invoice",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid",
      "description": "The unique identifier of the invoice.",
      "examples": [
        "01a7cfc1-2231-4589-9657-7f3004c06bd3"
      ]
    },
    "_link": {
      "type": "string",
      "description": "The unique URI of the invoice for the specified Job.",
      "examples": [
        "https://api.acculynx.com/api/v2/invoices/01a7cfc1-2231-4589-9657-7f3004c06bd3"
      ]
    },
    "jobId": {
      "type": "string",
      "format": "uuid",
      "description": "The unique identifier of the Job this invoice is for.",
      "examples": [
        "01a7cfc1-2231-4589-9657-7f3004c06bd3"
      ]
    },
    "invoiceNumber": {
      "type": "string",
      "description": "The number of the invoice.",
      "examples": [
        "10-1"
      ]
    },
    "invoiceSequence": {
      "type": "number",
      "description": "The sequential number assigned to the invoice as its created."
    },
    "invoiceDate": {
      "type": "string",
      "description": "The date/time the invoice in UTC format.",
      "examples": [
        "2015-07-28T17:48:59Z"
      ]
    },
    "dueDate": {
      "type": "string",
      "description": "The due date/time the invoice in UTC format.",
      "examples": [
        "2015-07-28T17:48:59Z"
      ]
    },
    "currentInvoiceState": {
      "type": "string",
      "description": "An identifier that provides an understanding of the state of the invoice.\n\n`Paid` `Unpaid` `Void` `Draft`",
      "enum": [
        "Paid",
        "Unpaid",
        "Void",
        "Draft"
      ],
      "examples": [
        "Paid"
      ]
    },
    "totalPrice": {
      "type": "number",
      "description": "The total price of the invoice."
    },
    "balanceDue": {
      "type": "number",
      "description": "The balance due left on the invoice."
    },
    "invoiceName": {
      "type": "string",
      "description": "The user entered name of the invoice."
    },
    "createdDate": {
      "type": "string",
      "description": "The date/time the invoice was created in UTC format.",
      "examples": [
        "2015-07-28T17:48:59Z"
      ]
    },
    "sortIndex": {
      "type": "number",
      "description": "The order the invoice will appear in the list when sorted by invoice sequence."
    },
    "recordingStatus": {
      "type": "string",
      "description": "Status of the invoice integration with external accounting integration."
    },
    "recordingClassification": {
      "type": "string",
      "description": "The user selected classification of the invoice set when recording the invoice."
    },
    "sections": {
      "type": "array",
      "items": InvoiceSection
    }
  }
} as const;
export default Invoice
