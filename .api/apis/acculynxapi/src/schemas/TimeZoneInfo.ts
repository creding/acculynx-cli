const TimeZoneInfo = {
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "The standard name of the timezone.",
      "examples": [
        "Central Standard Time"
      ]
    },
    "daylightName": {
      "type": "string",
      "description": "The name of the timezone for Daylight Saving Time.",
      "examples": [
        "Central Daylight Time"
      ]
    },
    "baseUtcOffset": {
      "type": "string",
      "description": "The standard UTC offset of the timezone.",
      "examples": [
        "-06:00:00"
      ]
    },
    "adjustedUtcOffset": {
      "type": "string",
      "description": "The current UTC offset of the timezone, accounting for Daylight Saving Time if currently active.",
      "examples": [
        "-05:00:00"
      ]
    },
    "supportsDaylightSavingTime": {
      "type": "boolean",
      "description": "Whether of not the timezone supports Daylight Saving Time."
    }
  },
  "title": "timeZoneInfo",
  "x-readme-ref-name": "timeZoneInfo"
} as const;
export default TimeZoneInfo
