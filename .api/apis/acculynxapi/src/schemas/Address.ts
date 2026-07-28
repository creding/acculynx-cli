import Country from './Country.js';
import State from './State.js';

const Address = {
  "type": "object",
  "title": "address",
  "x-readme-ref-name": "address",
  "properties": {
    "street1": {
      "type": "string",
      "examples": [
        "123 Main St."
      ]
    },
    "street2": {
      "type": "string",
      "examples": [
        "Apt 2"
      ]
    },
    "city": {
      "type": "string",
      "examples": [
        "Peoria"
      ]
    },
    "state": State,
    "zipCode": {
      "type": "string",
      "examples": [
        "61603"
      ]
    },
    "country": Country
  }
} as const;
export default Address
