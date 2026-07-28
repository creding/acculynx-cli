import Invoice from './Invoice.js';

const InvoiceCollection = {
  "title": "invoiceCollection",
  "x-readme-ref-name": "invoiceCollection",
  "type": "object",
  "properties": {
    "count": {
      "type": "integer",
      "description": "The total number of unfiltered items."
    },
    "pageSize": {
      "type": "integer",
      "description": "The requested or default page size."
    },
    "pageStartIndex": {
      "type": "integer",
      "description": "The requested or default index of the first element to return."
    },
    "items": {
      "type": "array",
      "items": Invoice
    }
  },
  "$schema": "http://json-schema.org/draft-04/schema#"
} as const;
export default InvoiceCollection
