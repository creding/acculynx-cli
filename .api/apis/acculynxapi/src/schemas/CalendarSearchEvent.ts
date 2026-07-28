import CompanyUserLink from './CompanyUserLink.js';
import JobLink from './JobLink.js';

const CalendarSearchEvent = {
  "type": "object",
  "title": "calendarSearchEvent",
  "x-readme-ref-name": "calendarSearchEvent",
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid",
      "description": "The unique GUID of the calendar event.",
      "examples": [
        "3fa85f64-5717-4562-b3fc-2c963f66afa6"
      ]
    },
    "eventType": {
      "type": "string",
      "enum": [
        "All",
        "Personal",
        "InitialAppointment",
        "MaterialDelivery",
        "CrewLabor"
      ],
      "description": "`All` `Personal` `InitialAppointment` `MaterialDelivery` `CrewLabor`"
    },
    "title": {
      "type": "string",
      "description": "The name of the calendar event.",
      "examples": [
        "Initial Appointment"
      ]
    },
    "attendees": {
      "type": "array",
      "items": CompanyUserLink
    },
    "job": JobLink,
    "allDay": {
      "type": "boolean",
      "description": "Whether the event is an all day event."
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
    "sharedWithCustomerPortal": {
      "type": "boolean",
      "description": "Indicates if the event is shared with the customer portal.",
      "examples": [
        true
      ]
    },
    "_link": {
      "type": "string",
      "description": "The URI of the this calendar event.",
      "examples": [
        "https://api.acculynx.com/api/v2/calendars/58ca0eab-7882-46a6-8456-854beae8fb4a/appointments/3fa85f64-5717-4562-b3fc-2c963f66afa6"
      ]
    }
  }
} as const;
export default CalendarSearchEvent
