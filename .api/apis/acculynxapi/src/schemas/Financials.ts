import WorksheetAmendmentLink from './WorksheetAmendmentLink.js';
import WorksheetLink from './WorksheetLink.js';

const Financials = {
  "title": "financials",
  "x-readme-ref-name": "financials",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid",
      "description": "The unique identifier of the Financials.",
      "examples": [
        "01a7cfc1-2231-4589-9657-7f3004c06bd3"
      ]
    },
    "_link": {
      "type": "string",
      "description": "The unique URI of the Financials for the specified Job.",
      "examples": [
        "https://api.acculynx.com/api/v2/jobs/01a7cfc1-2231-4589-9657-7f3004c06bd3/financials"
      ]
    },
    "jobId": {
      "type": "string",
      "format": "uuid",
      "description": "The unique identifier of the Job these financials are for.",
      "examples": [
        "01a7cfc1-2231-4589-9657-7f3004c06bd3"
      ]
    },
    "approvedJobValue": {
      "type": "number",
      "description": "The current approved Job Value.",
      "examples": [
        123.45
      ]
    },
    "balanceDue": {
      "type": "number",
      "description": "The current amount still owed on the job.",
      "examples": [
        123.45
      ]
    },
    "worksheetSectionTotals": {
      "type": "object",
      "description": "The totals of the Worksheet Sections on the Worksheet including all Amendment(s).",
      "properties": {
        "worksheetTotal": {
          "type": "number",
          "description": "The total of all worksheet sections across both the Worksheet and any Amendment(s).",
          "examples": [
            123.45
          ]
        },
        "changeOrderTotal": {
          "type": "number",
          "description": "The total of all change order sections across both the Worksheet and any Amendment(s).",
          "examples": [
            123.45
          ]
        },
        "insuranceClaimTotal": {
          "type": "number",
          "description": "The total of all insurance claim sections across both the Worksheet and any Amendment(s).",
          "examples": [
            123.45
          ]
        },
        "upgradeTotal": {
          "type": "number",
          "description": "The total of all upgrade sections across both the Worksheet and any Amendment(s).",
          "examples": [
            123.45
          ]
        },
        "discountTotal": {
          "type": "number",
          "description": "The total of all discount sections across both the Worksheet and any Amendment(s).",
          "examples": [
            123.45
          ]
        },
        "supplementTotal": {
          "type": "number",
          "description": "The total of all supplement sections across both the Worksheet and any Amendment(s).",
          "examples": [
            123.45
          ]
        },
        "workNotDoingTotal": {
          "type": "number",
          "description": "The total of all work not doing sections across both the Worksheet and any Amendment(s).",
          "examples": [
            123.45
          ]
        }
      }
    },
    "worksheet": {
      "description": "The Worksheet of the Job these financials are for.",
      "type": "array",
      "items": WorksheetLink
    },
    "amendments": {
      "type": "array",
      "description": "The Amendments of the Job these financials are for.",
      "items": WorksheetAmendmentLink
    }
  },
  "$schema": "http://json-schema.org/draft-04/schema#"
} as const;
export default Financials
