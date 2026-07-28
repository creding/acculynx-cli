const GetAppointmentById = {
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
          },
          "appointmentId": {
            "type": "string",
            "format": "uuid",
            "description": "The appointment's unique identifier"
          }
        },
        "required": [
          "calendarId",
          "appointmentId"
        ]
      }
    ]
  }
} as const;
export default GetAppointmentById
