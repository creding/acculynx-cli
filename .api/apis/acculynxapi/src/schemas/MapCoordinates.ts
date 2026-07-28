const MapCoordinates = {
  "type": "object",
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
    },
    "mapRadius": {
      "type": "integer",
      "description": "number of kilometers from (latitude, longitude) to consider",
      "default": 1
    }
  },
  "title": "mapCoordinates",
  "x-readme-ref-name": "mapCoordinates"
} as const;
export default MapCoordinates
