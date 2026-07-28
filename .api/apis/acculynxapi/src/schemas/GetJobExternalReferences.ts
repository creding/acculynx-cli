const GetJobExternalReferences = {
  "metadata": {
    "allOf": [
      {
        "$schema": "http://json-schema.org/draft-04/schema#",
        "type": "object",
        "properties": {
          "jobId": {
            "type": "string",
            "format": "uuid",
            "description": "The job's unique identifier"
          },
          "projectId": {
            "type": "string",
            "maxLength": 100,
            "examples": [
              "123453ID"
            ],
            "description": "The unique identifier of the project associated with the external reference."
          },
          "source": {
            "type": "string",
            "maxLength": 50,
            "examples": [
              "My first integration"
            ],
            "description": "The name of the source associated with the external reference."
          }
        },
        "required": [
          "jobId",
          "source"
        ]
      }
    ]
  }
} as const;
export default GetJobExternalReferences
