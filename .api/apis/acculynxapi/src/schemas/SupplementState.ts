const SupplementState = {
  "type": "object",
  "title": "supplementState",
  "x-readme-ref-name": "supplementState",
  "properties": {
    "supplementState": {
      "type": "string",
      "enum": [
        "Unknown",
        "Created",
        "InProgress",
        "Closed",
        "Applied",
        "Deleted"
      ],
      "description": "The state of the Supplement.\n\n`Unknown` `Created` `InProgress` `Closed` `Applied` `Deleted`",
      "examples": [
        "InProgress"
      ]
    }
  }
} as const;
export default SupplementState
