import CompanyUserLink from './CompanyUserLink.js';

const SupplementerAssigned = {
  "type": "object",
  "title": "supplementerAssigned",
  "x-readme-ref-name": "supplementerAssigned",
  "properties": {
    "supplementerAssigned": CompanyUserLink,
    "assignedDate": {
      "type": "string",
      "format": "date-time",
      "description": "The date/time when the supplementer was assigned.",
      "examples": [
        "2024-01-20T21:18:25Z"
      ]
    },
    "assignedBy": CompanyUserLink
  }
} as const;
export default SupplementerAssigned
