import CompanyUserLink from './CompanyUserLink.js';

const CompanyRepresentative = {
  "type": "object",
  "title": "companyRepresentative",
  "x-readme-ref-name": "companyRepresentative",
  "properties": {
    "id": {
      "type": "string",
      "description": "The unique ID of the Company Representative.",
      "format": "uuid",
      "examples": [
        "9c9502f7-72f0-4162-8643-4467d235ae62"
      ]
    },
    "type": {
      "type": "string",
      "description": "The type of the company representative.\n\n`CompanyRepresentative` `SalesOwner` `AROwner` `Additional`",
      "enum": [
        "CompanyRepresentative",
        "SalesOwner",
        "AROwner",
        "Additional"
      ]
    },
    "user": CompanyUserLink,
    "_link": {
      "type": "string",
      "description": "The unique URI for this resource.",
      "examples": [
        "https://api.acculynx.com/v2/jobs/61370abe-3534-4ba8-b2f2-2ff56cdd5e02/representatives/company"
      ]
    }
  }
} as const;
export default CompanyRepresentative
