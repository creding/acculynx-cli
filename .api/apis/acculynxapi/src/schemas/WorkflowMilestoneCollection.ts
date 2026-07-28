import WorkflowMilestoneItem from './WorkflowMilestoneItem.js';

const WorkflowMilestoneCollection = {
  "type": "object",
  "properties": {
    "items": {
      "type": "array",
      "items": WorkflowMilestoneItem
    }
  },
  "title": "workflowMilestoneCollection",
  "x-readme-ref-name": "workflowMilestoneCollection",
  "$schema": "http://json-schema.org/draft-04/schema#"
} as const;
export default WorkflowMilestoneCollection
