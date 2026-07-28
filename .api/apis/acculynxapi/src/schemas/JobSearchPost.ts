import MapCoordinates from './MapCoordinates.js';

const JobSearchPost = {
  "type": "object",
  "properties": {
    "searchTerm": {
      "type": "string",
      "description": "select the jobs that include this term.",
      "examples": [
        "Maple Lane"
      ]
    },
    "geoLocation": MapCoordinates
  },
  "title": "jobSearchPost",
  "x-readme-ref-name": "jobSearchPost",
  "$schema": "http://json-schema.org/draft-04/schema#"
} as const;
export default JobSearchPost
