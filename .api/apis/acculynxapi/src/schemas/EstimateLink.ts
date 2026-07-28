import JobLink from './JobLink.js';

const EstimateLink = {
  "type": "object",
  "title": "estimateLink",
  "x-readme-ref-name": "estimateLink",
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
      "description": "Whether the estimate is the primary estimate for its associated job."
    },
    "job": JobLink,
    "_link": {
      "type": "string",
      "description": "The unique URI of the Estimate for the specified Job.",
      "examples": [
        "https://api.acculynx.com/api/v2/estimates/01a7cfc1-2231-4589-9657-7f3004c06bd3"
      ]
    }
  }
} as const;
export default EstimateLink
