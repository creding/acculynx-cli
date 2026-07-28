import JobMilestoneStatus from './JobMilestoneStatus.js';

const JobMilestoneStatuses = {
  "type": "array",
  "title": "jobMilestoneStatuses",
  "x-readme-ref-name": "jobMilestoneStatuses",
  "items": JobMilestoneStatus
} as const;
export default JobMilestoneStatuses
