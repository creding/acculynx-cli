import CustomFieldBodyPut from './CustomFieldBodyPut.js';

const JobCustomFieldsBodyPut = {
  "type": "object",
  "properties": {
    "customFields": {
      "type": "array",
      "items": CustomFieldBodyPut,
      "minLength": 1,
      "maxLength": 120
    }
  },
  "title": "jobCustomFieldsBodyPut",
  "x-readme-ref-name": "jobCustomFieldsBodyPut",
  "$schema": "http://json-schema.org/draft-04/schema#"
} as const;
export default JobCustomFieldsBodyPut
