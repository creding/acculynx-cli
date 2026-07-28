const ContactSort = {
  "type": "object",
  "properties": {
    "sortDirection": {
      "type": "string",
      "enum": [
        "Ascending",
        "Descending"
      ],
      "description": "Sort direction of the search"
    },
    "sortColumn": {
      "type": "string",
      "enum": [
        "CreatedDate",
        "CompanyName",
        "ContactType",
        "firstName",
        "lastName",
        "LifeTimeValue"
      ],
      "description": "The columm to be sorted"
    }
  },
  "required": [
    "sortDirection",
    "sortColumn"
  ],
  "title": "contactSort",
  "x-readme-ref-name": "contactSort"
} as const;
export default ContactSort
