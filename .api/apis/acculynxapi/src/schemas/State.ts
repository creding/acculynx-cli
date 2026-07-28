const State = {
  "type": "object",
  "properties": {
    "id": {
      "type": "integer",
      "description": "The id for the state.",
      "examples": [
        43
      ]
    },
    "name": {
      "type": "string",
      "description": "The name of the State.",
      "examples": [
        "Texas"
      ]
    },
    "abbreviation": {
      "type": "string",
      "description": "The 2 character abbreviation for the State.",
      "minLength": 2,
      "maxLength": 2,
      "examples": [
        "TX"
      ]
    },
    "_link": {
      "type": "string",
      "description": "The URI of the State.",
      "examples": [
        "https://api.acculynx.com/api/v2/acculynx/countries/1/states/43"
      ]
    }
  },
  "title": "state",
  "x-readme-ref-name": "state"
} as const;
export default State
