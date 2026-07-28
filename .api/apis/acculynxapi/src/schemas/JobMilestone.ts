import JobMilestoneStatuses from './JobMilestoneStatuses.js';

const JobMilestone = {
  "title": "jobMilestone",
  "x-readme-ref-name": "jobMilestone",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid",
      "examples": [
        "40be7484-ece1-4a01-9b4c-2de030d0c841"
      ]
    },
    "_link": {
      "type": "string",
      "format": "uri",
      "examples": [
        "https://api.acculynx.com/api/v2/jobs/40be7484-ece1-4a01-9b4c-2de030d0c841"
      ]
    },
    "name": {
      "type": "string",
      "description": "This job's current milestone.\n\n`Lead` `Prospect` `Approved` `Completed` `Invoiced` `Closed` `Cancelled`",
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
    "isCurrent": {
      "type": "boolean",
      "examples": [
        true
      ]
    },
    "duration": {
      "type": "object",
      "properties": {
        "startDate": {
          "type": "string",
          "format": "date-time",
          "examples": [
            "2024-01-13T11:54:45Z"
          ]
        },
        "endDate": {
          "type": "string",
          "format": "date-time",
          "examples": [
            "2024-01-13T11:54:45Z"
          ]
        }
      }
    },
    "statuses": JobMilestoneStatuses
  },
  "$schema": "http://json-schema.org/draft-04/schema#"
} as const;
export default JobMilestone
