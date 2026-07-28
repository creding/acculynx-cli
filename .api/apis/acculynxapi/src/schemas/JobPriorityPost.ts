const JobPriorityPost = {
  "type": "string",
  "enum": [
    "Urgent",
    "High",
    "Normal"
  ],
  "description": "Priority of lead (Urgent, High, Normal).",
  "title": "jobPriorityPost",
  "x-readme-ref-name": "jobPriorityPost",
  "examples": [
    "Normal"
  ]
} as const;
export default JobPriorityPost
