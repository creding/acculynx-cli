import ExternalReference from './ExternalReference.js';

const ExternalReferenceList = {
  "type": "array",
  "items": ExternalReference,
  "title": "externalReferenceList",
  "x-readme-ref-name": "externalReferenceList",
  "$schema": "http://json-schema.org/draft-04/schema#"
} as const;
export default ExternalReferenceList
