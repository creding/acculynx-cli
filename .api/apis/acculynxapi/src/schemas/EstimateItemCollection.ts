import EstimateItem from './EstimateItem.js';

const EstimateItemCollection = {
  "title": "estimateItemCollection",
  "x-readme-ref-name": "estimateItemCollection",
  "type": "object",
  "properties": {
    "items": {
      "type": "array",
      "items": EstimateItem
    }
  },
  "$schema": "http://json-schema.org/draft-04/schema#"
} as const;
export default EstimateItemCollection
