const CompanyAccountType = {
  "title": "companyAccountType",
  "x-readme-ref-name": "companyAccountType",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid",
      "description": "The account type's unique identifier.",
      "examples": [
        "9b95199e-c161-41f3-8a09-3923791e0b73"
      ]
    },
    "_link": {
      "type": "string",
      "description": "The unique URI for this account type resource.",
      "examples": [
        "https://api.acculynx.com/v2/company-settings/location-settings/account-types/9b95199e-c161-41f3-8a09-3923791e0b73"
      ]
    },
    "name": {
      "type": "string",
      "description": "The name of the account type."
    },
    "IsActive": {
      "type": "boolean",
      "description": "The status of the account type."
    }
  }
} as const;
export default CompanyAccountType
