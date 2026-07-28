import JobInsuranceCompany from './JobInsuranceCompany.js';

const JobInsurance = {
  "title": "jobInsurance",
  "x-readme-ref-name": "jobInsurance",
  "type": "object",
  "properties": {
    "insuranceCompany": JobInsuranceCompany,
    "customInsuranceCompanyName": {
      "type": "string",
      "description": "A job can have an Insurance Company that is not from the list managed in Account Settings. In this case, `insuranceCompany` will be null.",
      "readOnly": true,
      "examples": [
        "An Insurance Company that is not managed in Account Settings."
      ]
    },
    "damagelocation": {
      "type": "string",
      "description": "Where the damage is located.",
      "examples": [
        "Near the chimney."
      ]
    },
    "dateOfLoss": {
      "type": "string",
      "description": "The date the damage occurred in UTC.",
      "examples": [
        "2020-07-23T16:56:27Z"
      ]
    },
    "claimFiled": {
      "type": "boolean",
      "description": "Has the claim been filed? Must be true if `claimFiledDate` is populated."
    },
    "claimFiledDate": {
      "type": "string",
      "description": "The date the claim was filed in UTC.",
      "examples": [
        "2020-07-23T16:56:27Z"
      ]
    },
    "claimNumber": {
      "type": "string",
      "description": "The identifier of the insurance claim given by the insurance company.",
      "examples": [
        "123abc"
      ]
    },
    "hasPaperwork": {
      "type": "boolean",
      "description": "Is the paperwork for this job collected?",
      "examples": [
        true
      ]
    }
  },
  "$schema": "http://json-schema.org/draft-04/schema#"
} as const;
export default JobInsurance
