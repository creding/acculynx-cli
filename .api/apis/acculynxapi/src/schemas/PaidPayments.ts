import PaidPayment from './PaidPayment.js';

const PaidPayments = {
  "type": "object",
  "properties": {
    "total": {
      "type": "number",
      "format": "float",
      "description": "The total sum of all paid payment amounts in this group.",
      "examples": [
        100
      ]
    },
    "paidPayments": {
      "type": "array",
      "items": PaidPayment
    }
  },
  "title": "paidPayments",
  "x-readme-ref-name": "paidPayments"
} as const;
export default PaidPayments
