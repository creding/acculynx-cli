import DocumentFoldersLink from './DocumentFoldersLink.js';

const DocumentFoldersCollection = {
  "title": "documentFoldersCollection",
  "x-readme-ref-name": "documentFoldersCollection",
  "type": "object",
  "properties": {
    "count": {
      "type": "integer",
      "description": "The total number of unfiltered items."
    },
    "pageSize": {
      "type": "integer",
      "description": "The requested or default page size."
    },
    "pageStartIndex": {
      "type": "integer",
      "description": "The requested or default index of the first element to return."
    },
    "items": {
      "type": "array",
      "items": DocumentFoldersLink
    }
  },
  "$schema": "http://json-schema.org/draft-04/schema#"
} as const;
export default DocumentFoldersCollection
