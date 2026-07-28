import SupplementNotationEmailRecipients from './SupplementNotationEmailRecipients.js';
import SupplementStatusLink from './SupplementStatusLink.js';

const SupplementNotation = {
  "title": "supplementNotation",
  "x-readme-ref-name": "supplementNotation",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid",
      "description": "The Notation unique identifier.",
      "examples": [
        "a646a794-4265-4b2b-bf01-1aa4afe127de"
      ]
    },
    "_link": {
      "type": "string",
      "format": "uri",
      "description": "The URI of the supplement notation.",
      "examples": [
        "https://api.acculynx.com/api/v2/supplements/b195ca49-aeff-4e19-8ddd-193e01f5e649/notations/a646a794-4265-4b2b-bf01-1aa4afe127de"
      ]
    },
    "status": SupplementStatusLink,
    "spokeWith": {
      "type": "string",
      "description": "The Notation SpokeWith Text.",
      "examples": [
        "salesGuy"
      ]
    },
    "notes": {
      "type": "string",
      "description": "The Notation Notes.",
      "examples": [
        "notation note"
      ]
    },
    "phone": {
      "type": "string",
      "description": "The Notation 10 digit phone number text.",
      "pattern": "^(?:\\(\\d{3}\\)|\\d{3})[-.\\s]?\\d{3}[-.\\s]?\\d{4}$",
      "examples": [
        "(123) 456-7891"
      ]
    },
    "extension": {
      "type": "string",
      "description": "The Notation Extension Text.",
      "examples": [
        "111"
      ]
    },
    "fax": {
      "type": "string",
      "description": "The Notation 10 digit fax number text.",
      "pattern": "^(?:\\(\\d{3}\\)|\\d{3})[-.\\s]?\\d{3}[-.\\s]?\\d{4}$",
      "examples": [
        "(132) 456-7890"
      ]
    },
    "email": {
      "type": "string",
      "description": "The Notation Email Text.",
      "format": "email",
      "examples": [
        "salesGuy@acculynx.com"
      ]
    },
    "createdBy": {
      "type": [
        "object",
        "null"
      ],
      "description": "",
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
    },
    "createdDate": {
      "type": "string",
      "format": "date-time",
      "description": "The date/time when this notation was created.",
      "examples": [
        "2024-01-20T21:18:25Z"
      ]
    },
    "emailRecipients": SupplementNotationEmailRecipients
  }
} as const;
export default SupplementNotation
