import CustomField from './CustomField.js';

const CustomFieldsCollection = {
  "title": "customFieldsCollection",
  "x-readme-ref-name": "customFieldsCollection",
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
      "items": CustomField
    }
  },
  "$schema": "http://json-schema.org/draft-04/schema#"
} as const;
export default CustomFieldsCollection
