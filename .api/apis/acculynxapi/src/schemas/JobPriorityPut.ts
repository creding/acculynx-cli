import JobPriority from './JobPriority.js';

const JobPriorityPut = {
  "type": "object",
  "properties": {
    "priority": JobPriority
  },
  "required": [
    "priority"
  ],
  "title": "jobPriorityPut",
  "x-readme-ref-name": "jobPriorityPut",
  "$schema": "http://json-schema.org/draft-04/schema#"
} as const;
export default JobPriorityPut
