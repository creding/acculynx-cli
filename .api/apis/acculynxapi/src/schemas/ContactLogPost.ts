import CompanyUserLink from './CompanyUserLink.js';
import ContactLogType from './ContactLogType.js';

const ContactLogPost = {
  "required": [
    "logDate",
    "type"
  ],
  "title": "contactLogPost",
  "x-readme-ref-name": "contactLogPost",
  "type": "object",
  "additionalProperties": true,
  "properties": {
    "logDate": {
      "type": "string",
      "format": "date-time",
      "description": "The DateTime for the log.\nAn ISO 8601 string of datetime including the time component and ending with 'Z' (so in UTC). \nhttps://en.wikipedia.org/wiki/ISO_8601#Coordinated_Universal_Time_(UTC)\n",
      "examples": [
        "2025-05-18T10:00:00Z"
      ]
    },
    "type": ContactLogType,
    "description": {
      "type": [
        "string",
        "null"
      ],
      "description": "A text with a description of the log.",
      "maxLength": 1000,
      "examples": [
        "Client called to check roof status."
      ]
    },
    "createdDate": {
      "type": "string",
      "format": "date-time",
      "description": "The DateTime when the log was created.\nAn ISO 8601 string of datetime including the time component and ending with 'Z' (so in UTC). \nhttps://en.wikipedia.org/wiki/ISO_8601#Coordinated_Universal_Time_(UTC)\n",
      "readOnly": true,
      "examples": [
        "2025-05-17T09:30:00Z"
      ]
    },
    "createdBy": CompanyUserLink,
    "id": {
      "type": "string",
      "description": "The log's unique ID.",
      "format": "uuid",
      "readOnly": true,
      "examples": [
        "cf3987e6-24bc-4b34-91bb-e230cd4ea6d7"
      ]
    },
    "_link": {
      "type": "string",
      "description": "Use this URI to perform GET operations on the individual log resource. This link follows the pattern: /v2/contacts/{contactId}/logs/{logId}",
      "readOnly": true,
      "examples": [
        "https://api.acculynx.com/v2/contacts/61370abe-3534-4ba8-b2f2-2ff56cdd5e02/logs/cf3987e6-24bc-4b34-91bb-e230cd4ea6d7"
      ]
    }
  },
  "$schema": "http://json-schema.org/draft-04/schema#"
} as const;
export default ContactLogPost
