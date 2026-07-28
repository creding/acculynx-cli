import CompanyUserLink from './CompanyUserLink.js';
import CustomFieldOption from './CustomFieldOption.js';

const CustomFieldDefinitionFull = {
  "type": "object",
  "title": "customFieldDefinitionFull",
  "x-readme-ref-name": "customFieldDefinitionFull",
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid",
      "description": "The unique identifier of the custom field definition.",
      "examples": [
        "e5e7f960-f4c3-481d-93d3-0fc2b44efa41"
      ]
    },
    "_link": {
      "type": "string",
      "description": "The unique URI of the custom field definition.",
      "examples": [
        "https://api.acculynx.com/api/v2/company-settings/custom-fields/e5e7f960-f4c3-481d-93d3-0fc2b44efa4"
      ]
    },
    "label": {
      "type": "string",
      "description": "The display label of the custom field definition.",
      "examples": [
        "Customer Preference"
      ]
    },
    "entityType": {
      "type": "string",
      "enum": [
        "contact",
        "job"
      ],
      "description": "Specifies the entity type (job, contact) for the custom field.\n\n`contact` `job`",
      "examples": [
        "job"
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
    "isActive": {
      "type": "boolean",
      "description": "Whether the custom field definition is active.",
      "examples": [
        true
      ]
    },
    "options": {
      "type": "array",
      "description": "The available options for dropdown-type custom fields.",
      "items": CustomFieldOption
    },
    "modifiedBy": CompanyUserLink,
    "modifiedDate": {
      "type": "string",
      "description": "The date/time the custom field definition was last modified, in UTC format.",
      "format": "date-time",
      "examples": [
        "2023-07-29T17:48:59Z"
      ]
    },
    "createdDate": {
      "type": "string",
      "description": "The date/time the custom field definition was created, in UTC format.",
      "format": "date-time",
      "examples": [
        "2023-07-29T17:48:59Z"
      ]
    }
  }
} as const;
export default CustomFieldDefinitionFull
