const AddJobDocumentPost = {
  "type": "object",
  "properties": {
    "file": {
      "type": "string",
      "format": "binary",
      "description": "The following file types are not allowed: .exe, .com, .dll, .msi, .bat, .cmd, .sh, .pl, .vbs, .py, .php"
    },
    "description": {
      "type": "string",
      "description": "A brief description of the file being uploaded",
      "examples": [
        "invoice for the job XS-3448"
      ]
    },
    "documentFolderId": {
      "type": "string",
      "format": "uuid",
      "description": "Indicates the folder ID where the job document will be saved.",
      "examples": [
        "d3a049c5-49d2-474a-9dba-8fcde2a68587"
      ]
    },
    "externalId": {
      "type": "string",
      "description": "A field to link the file with a job external reference identifier"
    },
    "externalSource": {
      "type": "string",
      "description": "A field to link the file with a job external reference source"
    }
  },
  "required": [
    "file",
    "documentFolderId"
  ],
  "title": "addJobDocumentPost",
  "x-readme-ref-name": "addJobDocumentPost",
  "$schema": "http://json-schema.org/draft-04/schema#"
} as const;
export default AddJobDocumentPost
