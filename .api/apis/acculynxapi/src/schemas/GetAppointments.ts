const GetAppointments = {
  "metadata": {
    "allOf": [
      {
        "$schema": "http://json-schema.org/draft-04/schema#",
        "type": "object",
        "properties": {
          "calendarId": {
            "type": "string",
            "format": "uuid",
            "description": "The calendar's unique identifier"
          }
        },
        "required": [
          "calendarId"
        ]
      },
      {
        "$schema": "http://json-schema.org/draft-04/schema#",
        "type": "object",
        "properties": {
          "eventType": {
            "type": "string",
            "default": "All",
            "examples": [
              "All,Personal,InitialAppointment"
            ],
            "description": "Enter one or more event types, separated by commas. \nOnly events with the specified types will be included in the response. \nIf no value is specified, the default value will be \"All\". \nPossible values: All, Personal, InitialAppointment, MaterialDelivery, CrewLabor\n"
          },
          "pageSize": {
            "type": "integer",
            "description": "How many items to be returned at a time."
          },
          "recordStartIndex": {
            "type": "integer",
            "default": 0,
            "description": "The index of the first element to return"
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
          "jobId": {
            "type": "string",
            "format": "uuid",
            "description": "The job's unique identifier"
          }
        },
        "required": [
          "startDate",
          "endDate"
        ]
      }
    ]
  }
} as const;
export default GetAppointments
