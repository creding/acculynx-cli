import WorkflowMilestoneStatusItem from './WorkflowMilestoneStatusItem.js';

const WorkflowMilestoneItem = {
  "type": "object",
  "properties": {
    "id": {
      "type": "integer",
      "description": "The unique identifier of the milestone.",
      "examples": [
        1
      ]
    },
    "name": {
      "type": "string",
      "title": "Milestone name",
      "enum": [
        "Lead",
        "Prospect",
        "Approved",
        "Completed",
        "Invoiced",
        "Closed",
        "Dead",
        "Deleted"
      ],
      "examples": [
        "Lead"
      ],
      "description": "`Lead` `Prospect` `Approved` `Completed` `Invoiced` `Closed` `Dead` `Deleted`"
    },
    "statuses": {
      "type": "array",
      "items": WorkflowMilestoneStatusItem
    }
  },
  "title": "workflowMilestoneItem",
  "x-readme-ref-name": "workflowMilestoneItem"
} as const;
export default WorkflowMilestoneItem
