import JobLink from './JobLink.js';

const CreateJob = {
  "response": {
    "201": {
      "oneOf": [
        JobLink
      ],
      "$schema": "http://json-schema.org/draft-04/schema#"
    },
    "429": {
      "type": "string",
      "$schema": "http://json-schema.org/draft-04/schema#"
    }
  }
} as const;
export default CreateJob
