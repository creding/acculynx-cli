const GeoLocation = {
  "type": "object",
  "title": "geoLocation",
  "x-readme-ref-name": "geoLocation",
  "properties": {
    "latitude": {
      "type": "number",
      "description": "latitude component of the map location",
      "examples": [
        40.689
      ]
    },
    "longitude": {
      "type": "number",
      "description": "longitude component of the map location",
      "examples": [
        -74.044
      ]
    }
  }
} as const;
export default GeoLocation
