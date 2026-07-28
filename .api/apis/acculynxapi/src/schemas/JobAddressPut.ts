const JobAddressPut = {
  "type": "object",
  "properties": {
    "street1": {
      "type": "string",
      "maxLength": 250,
      "examples": [
        "123 Main St."
      ]
    },
    "street2": {
      "type": "string",
      "maxLength": 50,
      "examples": [
        "Apt 2"
      ]
    },
    "city": {
      "type": "string",
      "maxLength": 50,
      "examples": [
        "Peoria"
      ]
    },
    "state": {
      "type": "string",
      "maxLength": 50,
      "examples": [
        "MI"
      ]
    },
    "country": {
      "type": "string",
      "maxLength": 50,
      "examples": [
        "US"
      ]
    },
    "zipCode": {
      "type": "string",
      "maxLength": 10,
      "examples": [
        "61603"
      ]
    }
  },
  "title": "jobAddressPut",
  "x-readme-ref-name": "jobAddressPut",
  "$schema": "http://json-schema.org/draft-04/schema#"
} as const;
export default JobAddressPut
