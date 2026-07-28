const AccountingIntegrationStatus = {
  "type": "object",
  "properties": {
    "jobSyncStatus": {
      "type": "string",
      "enum": [
        "RequestedSync",
        "Synced",
        "NotSynced",
        "Disconnected",
        "None"
      ],
      "description": "The unique identifier of the resource to post.\n\n`RequestedSync` `Synced` `NotSynced` `Disconnected` `None`",
      "examples": [
        "Synced"
      ]
    },
    "syncDate": {
      "type": "string",
      "format": "date-time",
      "description": "Date time of the latest syncronization.",
      "examples": [
        "2025-01-01T00:00:00Z"
      ]
    },
    "syncLocation": {
      "type": "string",
      "description": "Sync location for the job accounting info.",
      "examples": [
        "Some folder name"
      ]
    }
  },
  "title": "accountingIntegrationStatus",
  "x-readme-ref-name": "accountingIntegrationStatus",
  "$schema": "http://json-schema.org/draft-04/schema#"
} as const;
export default AccountingIntegrationStatus
