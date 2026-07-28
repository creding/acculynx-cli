const InitialAppointment = {
  "title": "initialAppointment",
  "x-readme-ref-name": "initialAppointment",
  "type": "object",
  "properties": {
    "_link": {
      "type": "string",
      "description": "The unique URI of the Initial Apppointment for the specified Job.",
      "examples": [
        "https://api.acculynx.com/api/v2/jobs/3bd1f24d-44f9-4633-83a1-5ff4f3921a01/initial-appointment"
      ]
    },
    "startDate": {
      "type": "string",
      "description": "An ISO 8601 string of the Initial Appointment's start datetime. https://en.wikipedia.org/wiki/ISO_8601",
      "examples": [
        "2020-06-22T18:47:10Z"
      ]
    },
    "endDate": {
      "type": "string",
      "description": "An ISO 8601 string of the Initial Appointment's end datetime. https://en.wikipedia.org/wiki/ISO_8601",
      "examples": [
        "2020-06-22T19:47:10Z"
      ]
    },
    "notes": {
      "type": "string"
    }
  },
  "$schema": "http://json-schema.org/draft-04/schema#"
} as const;
export default InitialAppointment
