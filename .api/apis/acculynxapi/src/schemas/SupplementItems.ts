import SupplementItem from './SupplementItem.js';

const SupplementItems = {
  "type": "object",
  "title": "supplementItems",
  "x-readme-ref-name": "supplementItems",
  "properties": {
    "totalOriginalClaimAmount": {
      "type": "number",
      "format": "float",
      "description": "Total of supplement items original claim amounts",
      "examples": [
        1200.6
      ]
    },
    "totalRequestedAmount": {
      "type": "number",
      "format": "float",
      "description": "Total of supplement items requested amounts",
      "examples": [
        1600.05
      ]
    },
    "totalApprovedAmount": {
      "type": "number",
      "format": "float",
      "description": "Total of supplement items approved amounts",
      "examples": [
        1700.4
      ]
    },
    "totalAppliedAmount": {
      "type": "number",
      "format": "float",
      "description": "Total of supplement items applied amounts",
      "examples": [
        1400.48
      ]
    },
    "items": {
      "type": "array",
      "items": SupplementItem
    }
  }
} as const;
export default SupplementItems
