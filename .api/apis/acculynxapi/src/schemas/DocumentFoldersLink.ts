const DocumentFoldersLink = {
  "type": "object",
  "title": "documentFoldersLink",
  "x-readme-ref-name": "documentFoldersLink",
  "properties": {
    "documentFolderId": {
      "type": "string",
      "format": "uuid",
      "description": "The unique ID of the folder for the document",
      "examples": [
        "3fa85f64-5717-4562-b3fc-2c963f66afa6"
      ]
    },
    "name": {
      "type": "string",
      "description": "The name of the Folder.",
      "examples": [
        "Folder Name"
      ]
    },
    "companyId": {
      "type": "string",
      "format": "uuid",
      "description": "The unique ID of the company",
      "examples": [
        "3fa85f64-5717-4562-b3fc-2c963f66afa6"
      ]
    },
    "description": {
      "type": "string",
      "description": "Description about the folder"
    }
  }
} as const;
export default DocumentFoldersLink
