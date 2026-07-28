import CompanyUserLink from './CompanyUserLink.js';

const JobAction = {
  "type": "object",
  "title": "jobAction",
  "x-readme-ref-name": "jobAction",
  "properties": {
    "action": {
      "type": "string",
      "description": "The action performed on this lead.",
      "examples": [
        "Company Representative changed from Jimmy to Julie"
      ]
    },
    "type": {
      "type": "string",
      "description": "The type of action.\n\n`Customer` `Job` `Lead` `Measurement` `Estimate` `Order` `Permit` `Payments` `Commission` `Precommission` `ContractWorksheet` `Supplement` `File` `Unspecified` `CommunicationHistory` `ContactNote` `JobContact` `Contact` `JobMessage` `ContractWorksheetStatus` `MortgageCheck` `Measurements` `Appointment` `JobEmail` `JobPacket` `Account` `Company` `User` `FeatureManager` `PermissionSettings` `LaborContact` `LaborOrder` `Financing` `JobSignatureEmail` `JobPaymentRequest` `TextMessage`",
      "enum": [
        "Customer",
        "Job",
        "Lead",
        "Measurement",
        "Estimate",
        "Order",
        "Permit",
        "Payments",
        "Commission",
        "Precommission",
        "ContractWorksheet",
        "Supplement",
        "File",
        "Unspecified",
        "CommunicationHistory",
        "ContactNote",
        "JobContact",
        "Contact",
        "JobMessage",
        "ContractWorksheetStatus",
        "MortgageCheck",
        "Measurements",
        "Appointment",
        "JobEmail",
        "JobPacket",
        "Account",
        "Company",
        "User",
        "FeatureManager",
        "PermissionSettings",
        "LaborContact",
        "LaborOrder",
        "Financing",
        "JobSignatureEmail",
        "JobPaymentRequest",
        "TextMessage"
      ],
      "examples": [
        "Job"
      ]
    },
    "date": {
      "type": "string",
      "description": "Date and time the action happened represented in UTC.",
      "examples": [
        "2020-06-22T05:00:00Z"
      ]
    },
    "createdBy": CompanyUserLink
  }
} as const;
export default JobAction
