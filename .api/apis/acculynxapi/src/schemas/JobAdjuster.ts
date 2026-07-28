import SimplePhone from './SimplePhone.js';

const JobAdjuster = {
  "type": "object",
  "properties": {
    "adjusterName": {
      "type": "string",
      "description": "The adjuster's name",
      "examples": [
        "John Smith"
      ]
    },
    "phone": SimplePhone,
    "fax": {
      "type": "string",
      "description": "The adjuster's fax",
      "examples": [
        "456-234-8888"
      ]
    },
    "email": {
      "type": "string",
      "description": "The adjuster's email",
      "examples": [
        "JohnSmith@RooferInsurance.com"
      ]
    },
    "claimApproved": {
      "type": "boolean",
      "description": "a true or false flag indicating whether or not the claim was approved",
      "examples": [
        false
      ]
    },
    "claimApprovedDate": {
      "type": "string",
      "description": "The date on which the claim was approved.",
      "examples": [
        "2025-03-11T00:00:00Z"
      ]
    },
    "metWithAdjuster": {
      "type": "boolean",
      "description": "a true or false flag indicating whether or not the party met with the adjuster",
      "examples": [
        true
      ]
    },
    "metWithAdjusterDate": {
      "type": "string",
      "description": "The date on which the party met with the adjuster.",
      "examples": [
        "2025-03-11T00:00:00Z"
      ]
    }
  },
  "title": "jobAdjuster",
  "x-readme-ref-name": "jobAdjuster",
  "$schema": "http://json-schema.org/draft-04/schema#"
} as const;
export default JobAdjuster
