const JobInsuranceCompanyPut = {
  "type": "object",
  "title": "jobInsuranceCompanyPut",
  "x-readme-ref-name": "jobInsuranceCompanyPut",
  "properties": {
    "insuranceCompanyId": {
      "type": [
        "string",
        "null"
      ],
      "format": "uuid",
      "description": "The insurance company's unique ID is to be set to the job.",
      "examples": [
        "5587886b-ed58-4a0c-9eda-61f7648b69b5"
      ]
    },
    "insuranceCompanyName": {
      "description": "A job can have an insurance company that is not from the list managed in Account Settings. In this case, the 'insuranceCompanyId' should be null. The text will be assigned to the comments field for the 'Other' (active) insurance company.",
      "type": [
        "string",
        "null"
      ],
      "minLength": 0,
      "maxLength": 100,
      "examples": [
        "An Insurance Company that is not managed in Account Settings."
      ]
    }
  }
} as const;
export default JobInsuranceCompanyPut
