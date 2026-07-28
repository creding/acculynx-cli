const PhotoVideoTag = {
  "title": "photoVideoTag",
  "x-readme-ref-name": "photoVideoTag",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "name of tag."
    },
    "id": {
      "type": "string",
      "format": "uuid",
      "examples": [
        "3fa85f64-5717-4562-b3fc-2c963f66afa6"
      ]
    }
  }
} as const;
export default PhotoVideoTag
