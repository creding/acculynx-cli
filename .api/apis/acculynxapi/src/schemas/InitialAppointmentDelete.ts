const InitialAppointmentDelete = {
  "type": "object",
  "properties": {
    "note": {
      "type": "string",
      "description": "Initial appointment removal description note.",
      "examples": [
        "Wrong date selected."
      ]
    }
  },
  "title": "initialAppointmentDelete",
  "x-readme-ref-name": "initialAppointmentDelete",
  "$schema": "http://json-schema.org/draft-04/schema#"
} as const;
export default InitialAppointmentDelete
