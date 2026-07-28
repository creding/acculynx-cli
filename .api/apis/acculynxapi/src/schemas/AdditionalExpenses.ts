import AdditionalExpense from './AdditionalExpense.js';

const AdditionalExpenses = {
  "type": "object",
  "properties": {
    "total": {
      "type": "number",
      "format": "float",
      "description": "The total sum of all additional expense amounts in this group.",
      "examples": [
        100
      ]
    },
    "additionalExpenses": {
      "type": "array",
      "items": AdditionalExpense
    }
  },
  "title": "additionalExpenses",
  "x-readme-ref-name": "additionalExpenses"
} as const;
export default AdditionalExpenses
