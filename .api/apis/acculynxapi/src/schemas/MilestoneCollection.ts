import Milestone from './Milestone.js';

const MilestoneCollection = {
  "title": "milestoneCollection",
  "x-readme-ref-name": "milestoneCollection",
  "type": "object",
  "properties": {
    "items": {
      "type": "array",
      "items": Milestone
    }
  },
  "$schema": "http://json-schema.org/draft-04/schema#"
} as const;
export default MilestoneCollection
