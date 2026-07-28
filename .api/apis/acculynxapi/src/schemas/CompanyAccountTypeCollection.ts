import CompanyAccountType from './CompanyAccountType.js';

const CompanyAccountTypeCollection = {
  "type": "object",
  "properties": {
    "items": {
      "type": "array",
      "items": CompanyAccountType
    }
  },
  "title": "companyAccountTypeCollection",
  "x-readme-ref-name": "companyAccountTypeCollection",
  "$schema": "http://json-schema.org/draft-04/schema#"
} as const;
export default CompanyAccountTypeCollection
