const JobTradeType = {
  "type": "object",
  "required": [
    "id"
  ],
  "title": "jobTradeType",
  "x-readme-ref-name": "jobTradeType",
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid",
      "description": "An unique identifier for the trade type.",
      "examples": [
        "c5163ff8-d1ee-482d-8915-fe038339aaf3"
      ]
    }
  }
} as const;
export default JobTradeType
