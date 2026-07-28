const WorkflowMilestoneStatusItem = {
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid",
      "description": "The unique identifier of the status.",
      "examples": [
        "5a228f89-0f8a-4f68-a14c-09da92845142"
      ]
    },
    "name": {
      "type": "string",
      "description": "The descriptive name of this status.",
      "examples": [
        "Lead status initial"
      ]
    }
  },
  "title": "workflowMilestoneStatusItem",
  "x-readme-ref-name": "workflowMilestoneStatusItem"
} as const;
export default WorkflowMilestoneStatusItem
