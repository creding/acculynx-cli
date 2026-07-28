const Date = {
  "type": "object",
  "properties": {
    "date": {
      "type": "string",
      "description": "Date and Time in UTC",
      "examples": [
        "2020-07-23T16:56:27Z"
      ]
    }
  },
  "title": "date",
  "x-readme-ref-name": "date",
  "$schema": "http://json-schema.org/draft-04/schema#"
} as const;
export default Date
