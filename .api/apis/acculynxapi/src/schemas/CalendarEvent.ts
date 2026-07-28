const CalendarEvent = {
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid",
      "description": "The unique GUID of the calendar event.",
      "examples": [
        "3fa85f64-5717-4562-b3fc-2c963f66afa6"
      ]
    },
    "title": {
      "type": "string",
      "description": "The name of the calendar event.",
      "examples": [
        "Initial Appointment"
      ]
    },
    "start": {
      "type": "string",
      "format": "date-time",
      "description": "The start date/time of the event.",
      "examples": [
        "2023-12-07T16:03:47Z"
      ]
    },
    "end": {
      "type": "string",
      "format": "date-time",
      "description": "The end date/time of the event.",
      "examples": [
        "2024-01-07T16:03:47Z"
      ]
    },
    "allDay": {
      "type": "boolean",
      "description": "Whether the event is an all day event."
    },
    "jobId": {
      "type": "string",
      "description": "The unique GUID of the job associated with the event, if any.",
      "examples": [
        "b4c09ad6-1d53-4a34-8a45-d989660e12d8"
      ]
    },
    "jobName": {
      "type": "string",
      "description": "The name of the job associated with the event, if any.\\",
      "examples": [
        "RC-2120: John Smith"
      ]
    },
    "location": {
      "type": "string",
      "description": "The address where the appointment is to take place.",
      "examples": [
        "123 Pleasant Grove Road, \\nACity, IL, 12345"
      ]
    },
    "notes": {
      "type": "string",
      "description": "other information related to the appointment.",
      "examples": [
        "Customer contact information:\\nCompany Name- Contact Name\\nJob: N/A\\n1234 Pleasant Grove Road, \\nACity, IL, 12345\\n(555) 123-45671 - mobile - Primary\\nmyemail@myprovider.net - Primary\\n"
      ]
    },
    "eventType": {
      "type": "string",
      "enum": [
        "Personal",
        "Initial Appointment",
        "Material Order",
        "Labor Order"
      ],
      "description": "`Personal` `Initial Appointment` `Material Order` `Labor Order`"
    },
    "_link": {
      "type": "string",
      "description": "The URI of the this calendar event.",
      "examples": [
        "https://api.acculynx.com/api/v2/calendars/58ca0eab-7882-46a6-8456-854beae8fb4a/appointments/3fa85f64-5717-4562-b3fc-2c963f66afa6"
      ]
    }
  },
  "title": "calendarEvent",
  "x-readme-ref-name": "calendarEvent",
  "$schema": "http://json-schema.org/draft-04/schema#"
} as const;
export default CalendarEvent
