import ContactLink from './ContactLink.js';

const JobContact = {
  "title": "jobContact",
  "x-readme-ref-name": "jobContact",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid",
      "description": "The contact's unique ID.",
      "examples": [
        "989ea7b8-f579-4db3-8417-bae1b3a8cd21"
      ]
    },
    "_link": {
      "type": "string",
      "description": "The URI of this contact.",
      "examples": [
        "https://api.acculynx.com/api/v2/jobs/e591bf22-9828-4144-bca8-42cbb8c6e2c0/contact/989ea7b8-f579-4db3-8417-bae1b3a8cd21"
      ]
    },
    "isPrimary": {
      "type": "boolean",
      "description": "Is this the primary contact for this job?"
    },
    "relationToPrimary": {
      "type": "string",
      "description": "how is this contact related to the primary contact?",
      "examples": [
        "Cousin"
      ]
    },
    "contact": {
      "description": "ContactLink object is included by default. Specify includes=contact in the request to include the full Contact object.",
      "oneOf": [
        ContactLink,
        {
          "type": "object",
          "properties": {
            "id": {
              "type": "string",
              "description": "The unique GUID identifying this contact.",
              "format": "uuid",
              "examples": [
                "61370abe-3534-4ba8-b2f2-2ff56cdd5e02"
              ]
            },
            "_link": {
              "type": "string",
              "description": "The unique URI for this resource.",
              "examples": [
                "https://api.acculynx.com/v2/contacts/61370abe-3534-4ba8-b2f2-2ff56cdd5e02"
              ]
            }
          }
        }
      ]
    }
  }
} as const;
export default JobContact
