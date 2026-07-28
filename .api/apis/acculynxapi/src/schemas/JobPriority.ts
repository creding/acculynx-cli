const JobPriority = {
  "type": "string",
  "enum": [
    "Urgent",
    "High",
    "Normal"
  ],
  "description": "Priority of job.",
  "title": "jobPriority",
  "x-readme-ref-name": "jobPriority",
  "examples": [
    "High"
  ]
} as const;
export default JobPriority
