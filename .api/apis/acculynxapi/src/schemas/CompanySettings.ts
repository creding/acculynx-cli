import TimeZoneInfo from './TimeZoneInfo.js';

const CompanySettings = {
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid",
      "description": "The company's unique identifier.",
      "examples": [
        "efd4b385-f9f8-41b6-a984-1d421b693fe1"
      ]
    },
    "name": {
      "type": "string",
      "description": "The name of the company."
    },
    "timeZoneInfo": TimeZoneInfo,
    "hasInsurance": {
      "type": "boolean",
      "description": "Whether the company has the insurance setting enabled."
    }
  },
  "title": "companySettings",
  "x-readme-ref-name": "companySettings",
  "$schema": "http://json-schema.org/draft-04/schema#"
} as const;
export default CompanySettings
