const CompanyUserLink = {
  "type": "object",
  "description": "",
  "title": "companyUserLink",
  "x-readme-ref-name": "companyUserLink",
  "properties": {
    "id": {
      "type": "string",
      "description": "The unique GUID of the AccuLynx User.",
      "format": "uuid",
      "examples": [
        "228db892-3b49-4455-b839-ffd8576d8731"
      ]
    },
    "_link": {
      "type": "string",
      "description": "The unique URI of the AccuLynx User.",
      "examples": [
        "https://api.acculynx.com/api/v2/users/228db892-3b49-4455-b839-ffd8576d8731"
      ]
    }
  }
} as const;
export default CompanyUserLink
