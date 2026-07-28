const Milestone = {
  "type": "object",
  "title": "milestone",
  "x-readme-ref-name": "milestone",
  "properties": {
    "name": {
      "type": "string",
      "description": "The name of the milestone.",
      "examples": [
        "Prospect"
      ]
    },
    "date": {
      "type": "string",
      "description": "Date and time the job was set to this milestone represented in UTC.",
      "examples": [
        "2020-06-22T05:00:00Z"
      ]
    }
  }
} as const;
export default Milestone
