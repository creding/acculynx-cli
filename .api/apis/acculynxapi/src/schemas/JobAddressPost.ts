const JobAddressPost = {
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
      "maxLength": 50,
      "examples": [
        "61603"
      ]
    }
  },
  "required": [
    "street1",
    "city",
    "state",
    "country",
    "zipCode"
  ],
  "title": "jobAddressPost",
  "x-readme-ref-name": "jobAddressPost"
} as const;
export default JobAddressPost
