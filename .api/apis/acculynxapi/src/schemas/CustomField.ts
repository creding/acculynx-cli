import CompanyUserLink from './CompanyUserLink.js';
import CustomFieldDefinition from './CustomFieldDefinition.js';
import CustomFieldValueItem from './CustomFieldValueItem.js';

const CustomField = {
  "type": "object",
  "title": "customField",
  "x-readme-ref-name": "customField",
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid",
      "examples": [
        "3fa85f64-5717-4562-b3fc-2c963f66afa6"
      ]
    },
    "_link": {
      "type": "string",
      "description": "The unique URI of the AccuLynx custom field value.",
      "examples": [
        "https://api-acculynx.com/api/v2/jobs/f4b85772-398d-4e2a-aba7-edbde6cf73fa/custom-fields/3fa85f64-5717-4562-b3fc-2c963f66afa6"
      ]
    },
    "customFieldDefinition": CustomFieldDefinition,
    "label": {
      "type": "string",
      "examples": [
        "Custom Field 1"
      ]
    },
    "fieldType": {
      "type": "string",
      "enum": [
        "Text",
        "Number",
        "Date",
        "Boolean"
      ],
      "description": "Specifies the data type (text, number, date, boolean) for the custom field.\n\n`Text` `Number` `Date` `Boolean`",
      "examples": [
        "Text"
      ]
    },
    "values": {
      "type": "array",
      "items": CustomFieldValueItem
    },
    "modifiedBy": CompanyUserLink,
    "modifiedDate": {
      "type": "string",
      "description": "The date/time the custom field was modified, in UTC format.",
      "examples": [
        "2015-07-29T17:48:59Z"
      ]
    }
  }
} as const;
export default CustomField
