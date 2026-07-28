import UnitOfMeasure from './UnitOfMeasure.js';

const UnitOfMeasureCollection = {
  "type": "object",
  "properties": {
    "unitsOfMeasure": {
      "type": "array",
      "items": UnitOfMeasure
    }
  },
  "title": "unitOfMeasureCollection",
  "x-readme-ref-name": "unitOfMeasureCollection",
  "$schema": "http://json-schema.org/draft-04/schema#"
} as const;
export default UnitOfMeasureCollection
