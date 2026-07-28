import WorkflowStatus from './WorkflowStatus.js';

const JobMilestoneStatus = {
  "title": "jobMilestoneStatus",
  "x-readme-ref-name": "jobMilestoneStatus",
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
      "description": "Name of the status",
      "examples": [
        "Repair tools requirements"
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
    "isCurrent": {
      "type": "boolean",
      "examples": [
        false
      ]
    },
    "workflowStatus": WorkflowStatus
  }
} as const;
export default JobMilestoneStatus
