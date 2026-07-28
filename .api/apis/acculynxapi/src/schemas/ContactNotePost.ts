import CompanyUserLink from './CompanyUserLink.js';

const ContactNotePost = {
  "required": [
    "note"
  ],
  "title": "contactNotePost",
  "x-readme-ref-name": "contactNotePost",
  "type": "object",
  "additionalProperties": true,
  "properties": {
    "note": {
      "type": "string",
      "description": "A text with the note.",
      "maxLength": 1000,
      "examples": [
        "Text from the note."
      ]
    },
    "createdDate": {
      "type": "string",
      "format": "date-time",
      "description": "The DateTime when the note was created.\nAn ISO 8601 string of datetime including the time component and ending with 'Z' (so in UTC). \nhttps://en.wikipedia.org/wiki/ISO_8601#Coordinated_Universal_Time_(UTC)\n",
      "readOnly": true,
      "examples": [
        "2026-03-25T09:30:00Z"
      ]
    },
    "createdBy": CompanyUserLink,
    "updatedDate": {
      "type": "string",
      "format": "date-time",
      "description": "The DateTime when the note was updated.\nAn ISO 8601 string of datetime including the time component and ending with 'Z' (so in UTC). \nhttps://en.wikipedia.org/wiki/ISO_8601#Coordinated_Universal_Time_(UTC)\n",
      "readOnly": true,
      "examples": [
        "2026-03-26T09:30:00Z"
      ]
    },
    "updatedBy": CompanyUserLink,
    "id": {
      "type": "string",
      "description": "The note's unique ID.",
      "format": "uuid",
      "readOnly": true,
      "examples": [
        "cf3987e6-24bc-4b34-91bb-e230cd4ea6d7"
      ]
    },
    "_link": {
      "type": "string",
      "description": "Use this URI to perform GET operations on the individual note resource. This link follows the pattern: /v2/contacts/{contactId}/notes/{noteId}",
      "readOnly": true,
      "examples": [
        "https://api.acculynx.com/v2/contacts/61370abe-3534-4ba8-b2f2-2ff56cdd5e02/notes/cf3987e6-24bc-4b34-91bb-e230cd4ea6d7"
      ]
    }
  },
  "$schema": "http://json-schema.org/draft-04/schema#"
} as const;
export default ContactNotePost
