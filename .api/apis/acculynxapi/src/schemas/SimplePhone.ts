const SimplePhone = {
  "description": "The adjuster's phone number.",
  "type": "object",
  "title": "simplePhone",
  "x-readme-ref-name": "simplePhone",
  "properties": {
    "number": {
      "type": "string",
      "description": "10 digit phone number.",
      "minLength": 10,
      "maxLength": 10,
      "pattern": "^\\d{10}$",
      "examples": [
        "3452347896"
      ]
    },
    "ext": {
      "type": "string",
      "examples": [
        "5454"
      ]
    },
    "type": {
      "type": "string",
      "enum": [
        "Home",
        "Mobile",
        "Work"
      ],
      "description": "`Home` `Mobile` `Work`"
    }
  }
} as const;
export default SimplePhone
