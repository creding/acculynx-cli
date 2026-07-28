const PaymentOverview = {
  "type": "object",
  "properties": {
    "salesAmount": {
      "type": "number",
      "description": "The total contracted sales amount for the job."
    },
    "balanceDue": {
      "type": "number",
      "description": "The balance left to be paid for the job."
    },
    "arAge": {
      "type": "integer",
      "description": "The A/R days for the job."
    },
    "percentageCollected": {
      "type": "integer",
      "description": "The percentage of the total contracted sales amount collected, to the nearest integer."
    }
  },
  "title": "paymentOverview",
  "x-readme-ref-name": "paymentOverview",
  "$schema": "http://json-schema.org/draft-04/schema#"
} as const;
export default PaymentOverview
