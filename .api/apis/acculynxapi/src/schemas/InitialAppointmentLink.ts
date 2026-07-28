const InitialAppointmentLink = {
  "type": "object",
  "title": "initialAppointmentLink",
  "x-readme-ref-name": "initialAppointmentLink",
  "properties": {
    "_link": {
      "type": "string",
      "description": "The unique URI of the Initial Apppointment for the specified Job.",
      "examples": [
        "https://api.acculynx.com/api/v2/jobs/3bd1f24d-44f9-4633-83a1-5ff4f3921a01/initial-appointment"
      ]
    }
  }
} as const;
export default InitialAppointmentLink
