import State from './State.js';

const StateCollection = {
  "type": "object",
  "properties": {
    "items": {
      "type": "array",
      "items": State
    }
  },
  "title": "stateCollection",
  "x-readme-ref-name": "stateCollection",
  "$schema": "http://json-schema.org/draft-04/schema#"
} as const;
export default StateCollection
