const JobMeasurement = {
  "type": "object",
  "properties": {
    "measurementOrderId": {
      "type": "string",
      "format": "uuid",
      "description": "The created measurement order unique identifier.",
      "examples": [
        "b07a494a-3928-46b4-940a-1c856ce17e70"
      ]
    }
  },
  "title": "jobMeasurement",
  "x-readme-ref-name": "jobMeasurement",
  "$schema": "http://json-schema.org/draft-04/schema#"
} as const;
export default JobMeasurement
