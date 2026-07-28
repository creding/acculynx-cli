import EstimateSection from './EstimateSection.js';

const EstimateSectionCollection = {
  "title": "estimateSectionCollection",
  "x-readme-ref-name": "estimateSectionCollection",
  "type": "object",
  "properties": {
    "items": {
      "type": "array",
      "items": EstimateSection
    }
  },
  "$schema": "http://json-schema.org/draft-04/schema#"
} as const;
export default EstimateSectionCollection
