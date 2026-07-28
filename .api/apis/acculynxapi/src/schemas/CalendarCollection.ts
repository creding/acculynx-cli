import CalendarLink from './CalendarLink.js';

const CalendarCollection = {
  "title": "calendarCollection",
  "x-readme-ref-name": "calendarCollection",
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
      "items": CalendarLink
    }
  },
  "$schema": "http://json-schema.org/draft-04/schema#"
} as const;
export default CalendarCollection
