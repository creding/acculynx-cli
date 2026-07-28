import CompanyUserLink from './CompanyUserLink.js';
import EstimateFinancials from './EstimateFinancials.js';
import EstimateSectionLink from './EstimateSectionLink.js';
import JobLink from './JobLink.js';

const Estimate = {
  "title": "estimate",
  "x-readme-ref-name": "estimate",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid",
      "description": "The unique identifier of the estimate.",
      "examples": [
        "01a7cfc1-2231-4589-9657-7f3004c06bd3"
      ]
    },
    "isPrimary": {
      "type": "boolean",
      "description": "Whether the estimate is primary for the job."
    },
    "job": JobLink,
    "_link": {
      "type": "string",
      "description": "The unique URI of the Estimate for the specified Job.",
      "examples": [
        "https://api.acculynx.com/api/v2/estimates/01a7cfc1-2231-4589-9657-7f3004c06bd3"
      ]
    },
    "title": {
      "type": "string",
      "description": "The title of the estimate.",
      "examples": [
        "Estimate 1"
      ]
    },
    "description": {
      "type": "string",
      "description": "A description of the estimate."
    },
    "estimateNumber": {
      "type": "string",
      "description": "An identifier that can be set to match other internal documentation. By default each new estimate will increment the estimateNumber by 1",
      "examples": [
        "'3' - or - 'Some Meaningful String'"
      ]
    },
    "createdBy": CompanyUserLink,
    "createdDate": {
      "type": "string",
      "description": "The date/time the estimate was created, in UTC format.",
      "examples": [
        "2015-07-28T17:48:59Z"
      ]
    },
    "modifiedBy": CompanyUserLink,
    "modifiedDate": {
      "type": "string",
      "description": "The date/time the estimate was modified, in UTC format.",
      "examples": [
        "2015-07-29T17:48:59Z"
      ]
    },
    "profitMarginRate": {
      "type": "number",
      "description": "The rate of profit on the estimate total."
    },
    "profitMarginTotal": {
      "type": "number",
      "description": "The total profit for the estimate."
    },
    "notes": {
      "type": "string",
      "description": "Additional notes about the estimate."
    },
    "financials": EstimateFinancials,
    "sections": {
      "type": "array",
      "items": EstimateSectionLink
    }
  },
  "$schema": "http://json-schema.org/draft-04/schema#"
} as const;
export default Estimate
