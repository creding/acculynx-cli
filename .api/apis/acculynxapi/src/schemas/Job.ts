import Address from './Address.js';
import GeoLocation from './GeoLocation.js';
import InitialAppointmentLink from './InitialAppointmentLink.js';
import JobCategory from './JobCategory.js';
import JobContact from './JobContact.js';
import LeadDeadReason from './LeadDeadReason.js';
import LeadSource from './LeadSource.js';
import TradeType from './TradeType.js';
import WorkType from './WorkType.js';

const Job = {
  "title": "job",
  "x-readme-ref-name": "job",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid",
      "description": "The job's unique ID.",
      "examples": [
        "e591bf22-9828-4144-bca8-42cbb8c6e2c0"
      ]
    },
    "_link": {
      "type": "string",
      "description": "The URI of this Job.",
      "examples": [
        "https://api.acculynx.com/api/v2/jobs/e591bf22-9828-4144-bca8-42cbb8c6e2c0"
      ]
    },
    "contacts": {
      "type": "array",
      "description": "The contact's default properties can be included with optional include parameter.",
      "items": JobContact
    },
    "locationAddress": Address,
    "geoLocation": GeoLocation,
    "tradeTypes": {
      "type": "array",
      "description": "The list of trades assigned",
      "items": TradeType
    },
    "jobCategory": JobCategory,
    "workType": WorkType,
    "leadSource": LeadSource,
    "initialAppointment": InitialAppointmentLink,
    "leadDeadReason": LeadDeadReason,
    "milestoneDate": {
      "type": "string",
      "format": "date-time",
      "description": "The date/time when the job entered its current milestone.",
      "examples": [
        "2021-01-20T21:18:25Z"
      ]
    },
    "createdDate": {
      "type": "string",
      "format": "date-time",
      "description": "The date/time when this job was created.",
      "examples": [
        "2021-01-20T21:18:25Z"
      ]
    },
    "modifiedDate": {
      "type": "string",
      "format": "date-time",
      "description": "The date/time when this job was last modified (touched).",
      "examples": [
        "2021-01-20T21:18:25Z"
      ]
    },
    "currentMilestone": {
      "type": "string",
      "description": "This job's current milestone. This field is Read Only.\n\n`Lead` `Prospect` `Approved` `Completed` `Invoiced` `Closed` `Cancelled`",
      "enum": [
        "Lead",
        "Prospect",
        "Approved",
        "Completed",
        "Invoiced",
        "Closed",
        "Cancelled"
      ],
      "examples": [
        "Prospect"
      ]
    },
    "jobNumber": {
      "type": "string",
      "description": "The alphanumeric identifier for the job, as definied by the company settings.",
      "examples": [
        "JK-2964"
      ]
    },
    "jobName": {
      "type": "string",
      "description": "The full name for this job.",
      "examples": [
        "JK-2964: John Smith"
      ]
    },
    "priority": {
      "type": "string",
      "description": "The job assigned priority\n\n`Normal` `High` `Urgent`",
      "enum": [
        "Normal",
        "High",
        "Urgent"
      ],
      "examples": [
        "Urgent"
      ]
    }
  }
} as const;
export default Job
