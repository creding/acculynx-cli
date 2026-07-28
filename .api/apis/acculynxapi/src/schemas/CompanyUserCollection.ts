import CompanyUser from './CompanyUser.js';

const CompanyUserCollection = {
  "title": "companyUserCollection",
  "x-readme-ref-name": "companyUserCollection",
  "type": "object",
  "properties": {
    "count": {
      "type": "integer",
      "description": "The total number of unfiltered items."
    },
    "pageSize": {
      "type": "integer",
      "description": "The requested or default page size."
    },
    "pageStartIndex": {
      "type": "integer",
      "description": "The requested or default index of the first element to return."
    },
    "items": {
      "type": "array",
      "items": CompanyUser
    }
  },
  "$schema": "http://json-schema.org/draft-04/schema#"
} as const;
export default CompanyUserCollection
