const InitialAppointmentPut = {
  "type": "object",
  "properties": {
    "startDate": {
      "type": "string",
      "description": "An ISO 8601 string of the Initial Appointment's start datetime including the time component and ending with 'Z' (so in UTC). https://en.wikipedia.org/wiki/ISO_8601#Coordinated_Universal_Time_(UTC)",
      "examples": [
        "2020-06-22T18:47:10Z"
      ]
    },
    "endDate": {
      "type": "string",
      "description": "An ISO 8601 string of the Initial Appointment's start datetime including the time component and ending with 'Z' (so in UTC). https://en.wikipedia.org/wiki/ISO_8601#Coordinated_Universal_Time_(UTC)",
      "examples": [
        "2020-06-22T19:47:10Z"
      ]
    },
    "notes": {
      "type": "string"
    }
  },
  "title": "initialAppointmentPut",
  "x-readme-ref-name": "initialAppointmentPut",
  "$schema": "http://json-schema.org/draft-04/schema#"
} as const;
export default InitialAppointmentPut
