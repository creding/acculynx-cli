const UnitOfMeasure = {
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid",
      "description": "Unit of measure unique identifier",
      "examples": [
        "3fa85f64-5717-4562-b3fc-2c963f66afa6"
      ]
    },
    "name": {
      "description": "The name of the unit of measure.",
      "type": "string",
      "examples": [
        "YD"
      ]
    },
    "friendlyName": {
      "description": "The friendly name of the unit of measure.",
      "type": "string",
      "examples": [
        "Yarda"
      ]
    }
  },
  "title": "unitOfMeasure",
  "x-readme-ref-name": "unitOfMeasure"
} as const;
export default UnitOfMeasure
