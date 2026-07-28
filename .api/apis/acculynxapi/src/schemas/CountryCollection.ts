import Country from './Country.js';

const CountryCollection = {
  "type": "object",
  "properties": {
    "items": {
      "type": "array",
      "items": Country
    }
  },
  "title": "countryCollection",
  "x-readme-ref-name": "countryCollection",
  "$schema": "http://json-schema.org/draft-04/schema#"
} as const;
export default CountryCollection
