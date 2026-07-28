const CalendarLink = {
  "type": "object",
  "title": "calendarLink",
  "x-readme-ref-name": "calendarLink",
  "properties": {
    "id": {
      "type": "string",
      "description": "The unique ID of the Calendar.",
      "format": "uuid",
      "examples": [
        "fa3b4dce-d1a9-4fb7-84d6-192e139f15b2"
      ]
    },
    "name": {
      "type": "string",
      "description": "The name of the Calendar.",
      "examples": [
        "Location Calendar"
      ]
    }
  }
} as const;
export default CalendarLink
