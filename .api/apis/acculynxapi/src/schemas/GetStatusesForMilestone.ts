const GetStatusesForMilestone = {
  "metadata": {
    "allOf": [
      {
        "$schema": "http://json-schema.org/draft-04/schema#",
        "type": "object",
        "properties": {
          "milestone": {
            "type": "string",
            "examples": [
              "lead"
            ],
            "description": "Include only status currently in one of the listed milestone. Only one value is allowed. Possible values: lead, prospect, approved, completed, invoiced, closed, cancelled"
          }
        },
        "required": [
          "milestone"
        ]
      }
    ]
  }
} as const;
export default GetStatusesForMilestone
