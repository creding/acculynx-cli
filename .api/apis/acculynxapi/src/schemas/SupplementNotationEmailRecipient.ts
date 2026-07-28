import CompanyUserLink from './CompanyUserLink.js';

const SupplementNotationEmailRecipient = {
  "type": "object",
  "title": "supplementNotationEmailRecipient",
  "x-readme-ref-name": "supplementNotationEmailRecipient",
  "properties": {
    "id": {
      "type": "integer",
      "description": "The identifier for the notation recipient.",
      "examples": [
        2
      ]
    },
    "companyUser": CompanyUserLink
  }
} as const;
export default SupplementNotationEmailRecipient
