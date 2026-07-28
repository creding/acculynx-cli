import CompanyUserLink from './CompanyUserLink.js';
import EstimateFinancials from './EstimateFinancials.js';
import EstimateItemLink from './EstimateItemLink.js';

const EstimateSection = {
  "type": "object",
  "title": "estimateSection",
  "x-readme-ref-name": "estimateSection",
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid",
      "description": "The unique ID for the estimate section.",
      "examples": [
        "43bc3071-8701-4514-92d2-0ab6934bbacc"
      ]
    },
    "title": {
      "type": "string",
      "description": "The title of the estimate section.",
      "examples": [
        "Roofing"
      ]
    },
    "description": {
      "type": "string",
      "description": "A description of the estimate section."
    },
    "createdBy": CompanyUserLink,
    "createdDate": {
      "type": "string",
      "description": "The date/time the estimate section was created, in UTC format.",
      "examples": [
        "2015-07-28T17:48:59Z"
      ]
    },
    "modifiedBy": CompanyUserLink,
    "modifiedDate": {
      "type": "string",
      "description": "The date/time the estimate section was modified, in UTC format.",
      "examples": [
        "2015-07-29T17:48:59Z"
      ]
    },
    "profitMarginRate": {
      "type": "number",
      "description": "The rate of profit on the estimate section."
    },
    "profitMarginTotal": {
      "type": "number",
      "description": "The total profit for the estimate section."
    },
    "sectionFinancials": EstimateFinancials,
    "items": {
      "type": "array",
      "items": EstimateItemLink
    },
    "_link": {
      "type": "string",
      "description": "The unique URI of the Estimate Section.",
      "examples": [
        "https://api.acculynx.com/api/v2/estimates/01a7cfc1-2231-4589-9657-7f3004c06bd3/sections/43bc3071-8701-4514-92d2-0ab6934bbacc"
      ]
    }
  }
} as const;
export default EstimateSection
