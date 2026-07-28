import ReceivedPayment from './ReceivedPayment.js';

const ReceivedPayments = {
  "type": "object",
  "properties": {
    "total": {
      "type": "number",
      "format": "float",
      "description": "The total sum of all received payment amounts in this group.",
      "examples": [
        100
      ]
    },
    "receivedPayments": {
      "type": "array",
      "items": ReceivedPayment
    }
  },
  "title": "receivedPayments",
  "x-readme-ref-name": "receivedPayments"
} as const;
export default ReceivedPayments
