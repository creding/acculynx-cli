import CompanyUserLink from './CompanyUserLink.js';

const LeadAction = {
  "type": "object",
  "properties": {
    "action": {
      "type": "string",
      "description": "The action performed on this lead.",
      "examples": [
        "Lead was created."
      ]
    },
    "date": {
      "type": "string",
      "description": "Date and time the action happened represented in UTC.",
      "examples": [
        "2020-06-22T05:00:00Z"
      ]
    },
    "createdBy": CompanyUserLink,
    "leadDeadReason": {
      "type": "string"
    }
  },
  "title": "leadAction",
  "x-readme-ref-name": "leadAction"
} as const;
export default LeadAction
