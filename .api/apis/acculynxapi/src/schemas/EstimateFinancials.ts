const EstimateFinancials = {
  "type": "object",
  "title": "estimateFinancials",
  "x-readme-ref-name": "estimateFinancials",
  "properties": {
    "taxRate": {
      "type": "number",
      "description": "The rate of tax for the estimate."
    },
    "taxTotal": {
      "type": "number",
      "description": "The total tax for the estimate."
    },
    "overheadRate": {
      "type": "number",
      "description": "The rate of overhead for the estimate."
    },
    "overheadTotal": {
      "type": "number",
      "description": "The total overhead for the estimate."
    },
    "profitRate": {
      "type": "number",
      "description": "The rate of profit for the estimate."
    },
    "profitTotal": {
      "type": "number",
      "description": "The total profit for the estimate."
    },
    "totalCost": {
      "type": "number",
      "description": "The total cost for the estimate."
    },
    "totalPrice": {
      "type": "number",
      "description": "The total price for the estimate."
    }
  }
} as const;
export default EstimateFinancials
