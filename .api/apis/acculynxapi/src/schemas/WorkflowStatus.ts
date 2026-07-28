const WorkflowStatus = {
  "type": "object",
  "title": "workflowStatus",
  "x-readme-ref-name": "workflowStatus",
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid",
      "description": "Unique identifier of the workflow milestone status defined in company settings.",
      "examples": [
        "85ef9e16-07cf-41a7-be04-533204d7c71a"
      ]
    },
    "name": {
      "type": "string",
      "examples": [
        "Repair tools requirements"
      ]
    }
  }
} as const;
export default WorkflowStatus
