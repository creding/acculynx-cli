import JobLink from './JobLink.js';
import SupplementItems from './SupplementItems.js';
import SupplementNotations from './SupplementNotations.js';
import SupplementState from './SupplementState.js';
import SupplementerAssigned from './SupplementerAssigned.js';

const Supplement = {
  "title": "supplement",
  "x-readme-ref-name": "supplement",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid",
      "description": "The supplement unique identifier.",
      "examples": [
        "b195ca49-aeff-4e19-8ddd-193e01f5e649"
      ]
    },
    "_link": {
      "type": "string",
      "format": "uri",
      "description": "The URI of the supplement.",
      "examples": [
        "https://api.acculynx.com/api/v2/supplements/b195ca49-aeff-4e19-8ddd-193e01f5e649"
      ]
    },
    "status": {
      "type": [
        "object",
        "null"
      ],
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "The supplement status unique identifier.",
          "examples": [
            "528806c3-c914-498a-80c7-59a98eb9bd44"
          ]
        },
        "_link": {
          "type": "string",
          "format": "uri",
          "description": "The URI of the Supplement Status.",
          "examples": [
            "https://api.acculynx.com/api/v2/company-settings/supplements/statuses/528806c3-c914-498a-80c7-59a98eb9bd44"
          ]
        }
      }
    },
    "name": {
      "type": "string",
      "description": "Supplement description.",
      "examples": [
        "Supplement #1"
      ]
    },
    "state": SupplementState,
    "job": JobLink,
    "assignedSupplementer": SupplementerAssigned,
    "itemsToSupplement": SupplementItems,
    "notations": SupplementNotations,
    "createdDate": {
      "type": "string",
      "format": "date-time",
      "description": "The date/time when this supplement was created.",
      "examples": [
        "2024-01-20T21:18:25Z"
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
    "editedDate": {
      "type": "string",
      "format": "date-time",
      "description": "The date/time when this supplement was last updated.",
      "examples": [
        "2024-01-20T21:18:25Z"
      ]
    },
    "editedBy": {
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
    "closedDate": {
      "type": "string",
      "format": "date-time",
      "description": "The date/time when this supplement was closed.",
      "examples": [
        "2024-01-20T21:18:25Z"
      ]
    },
    "closedBy": {
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
    "appliedDate": {
      "type": "string",
      "format": "date-time",
      "description": "The date/time when this supplement was applied.",
      "examples": [
        "2024-01-20T21:18:25Z"
      ]
    },
    "appliedBy": {
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
    }
  }
} as const;
export default Supplement
