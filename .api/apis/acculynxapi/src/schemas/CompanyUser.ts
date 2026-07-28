import CompanyUserRole from './CompanyUserRole.js';

const CompanyUser = {
  "type": "object",
  "title": "companyUser",
  "x-readme-ref-name": "companyUser",
  "properties": {
    "id": {
      "type": "string",
      "description": "The unique ID of the Company User.",
      "format": "uuid",
      "examples": [
        "228db892-3b49-4455-b839-ffd8576d8731"
      ]
    },
    "displayName": {
      "type": "string",
      "description": "The display name of the user."
    },
    "firstName": {
      "type": "string",
      "description": "The user's first name."
    },
    "lastName": {
      "type": "string",
      "description": "The user's last name."
    },
    "initials": {
      "type": "string",
      "description": "The user's initials."
    },
    "role": CompanyUserRole,
    "status": {
      "type": "string",
      "enum": [
        "Active",
        "Inactive",
        "Archived",
        "Deleted"
      ],
      "description": "the status of this user account.\n\n`Active` `Inactive` `Archived` `Deleted`"
    },
    "phone": {
      "type": "string",
      "description": "The user's phone number."
    },
    "mobilePhone": {
      "type": "string",
      "description": "The user's mobile phone number."
    },
    "email": {
      "type": "string",
      "description": "The user's email address."
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
export default CompanyUser
