const Country = {
  "type": "object",
  "properties": {
    "id": {
      "type": "integer",
      "description": "The id for the Country.",
      "examples": [
        1
      ]
    },
    "name": {
      "type": "string",
      "description": "The name of the Country.",
      "examples": [
        "United States"
      ]
    },
    "abbreviation": {
      "type": "string",
      "description": "The 2 character abbreviation for the Country.",
      "minLength": 2,
      "maxLength": 2,
      "examples": [
        "US"
      ]
    },
    "_link": {
      "type": "string",
      "description": "The URI of the Country.",
      "examples": [
        "https://api.acculynx.com/api/v2/acculynx/countries/1"
      ]
    }
  },
  "title": "country",
  "x-readme-ref-name": "country"
} as const;
export default Country
