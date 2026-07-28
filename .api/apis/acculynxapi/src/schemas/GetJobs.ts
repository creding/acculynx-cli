const GetJobs = {
  "metadata": {
    "allOf": [
      {
        "$schema": "http://json-schema.org/draft-04/schema#",
        "type": "object",
        "properties": {
          "pageSize": {
            "type": "integer",
            "description": "How many items to be returned at a time."
          },
          "recordStartIndex": {
            "type": "integer",
            "default": 0,
            "description": "The index of the first element to return"
          },
          "includes": {
            "type": "string",
            "description": "Optional fields to include in full with the response."
          },
          "startDate": {
            "type": "string",
            "format": "date",
            "description": "Start date for the query, in YYYY-MM-DD format."
          },
          "endDate": {
            "type": "string",
            "format": "date",
            "description": "End date for the query, in YYYY-MM-DD format."
          },
          "dateFilterType": {
            "type": "string",
            "enum": [
              "CreatedDate",
              "MilestoneDate",
              "ModifiedDate"
            ],
            "default": "CreatedDate",
            "description": "The date field to which startDate/endDate apply.  Ignored when neither startDate nor endDate is given."
          },
          "milestones": {
            "type": "string",
            "default": "lead,prospect,approved,completed,invoiced,closed,cancelled",
            "examples": [
              "lead,prospect"
            ],
            "description": "Include only jobs currently in one of the listed milestones.\nEnter one or more values, separated by commas. The default is no  milestone filtering.\nPossible values: lead, prospect, approved, completed, invoiced, closed, cancelled, dead.\n\n**Note: When filtering for dead leads ensure that the assignment is set to unassigned, otherwise no results will be returned.**\n"
          },
          "sortBy": {
            "type": "string",
            "enum": [
              "CreatedDate",
              "MilestoneDate",
              "ModifiedDate"
            ],
            "default": "CreatedDate",
            "description": "sort the returned jobs by this date field."
          },
          "sortOrder": {
            "type": "string",
            "enum": [
              "Ascending",
              "Descending"
            ],
            "default": "Ascending",
            "description": "return jobs in Ascending (default) or Descending order"
          },
          "assignment": {
            "type": "string",
            "enum": [
              "assigned",
              "unassigned"
            ],
            "description": "Optional field to filter only unassigned jobs in the response. Possible values: unassigned, assigned"
          }
        }
      }
    ]
  }
} as const;
export default GetJobs
