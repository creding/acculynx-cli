const IdPost = {
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid",
      "description": "The unique identifier of the resource to post."
    }
  },
  "title": "idPost",
  "x-readme-ref-name": "idPost",
  "$schema": "http://json-schema.org/draft-04/schema#"
} as const;
export default IdPost
