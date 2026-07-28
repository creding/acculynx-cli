const JobMeasurementsPostFiles = {
  "type": "object",
  "properties": {
    "measurementsFile": {
      "type": "string",
      "format": "binary",
      "description": "The file must be uploaded to the job to initiate the creation of a new measurement order. This file should contain the relevant measurements. \n\nThe permitted file formats are XML and JSON.\n"
    },
    "reportPdf": {
      "type": "string",
      "format": "binary",
      "description": "PDF File to be Uploaded attached to the measurement order that corresponds to the order report, it will be related to the job."
    },
    "miscPdfs": {
      "type": "array",
      "items": {
        "type": "string",
        "format": "binary"
      },
      "description": "A list of PDF Files to be attached to the new measurement order, a maximum of 10 files are allowed.",
      "minItems": 0,
      "maxItems": 10
    },
    "latitude": {
      "type": "number",
      "format": "double",
      "minimum": -90,
      "maximum": 90,
      "description": "Latitude of the map location for the new measurement order, value between -90 and 90.",
      "examples": [
        50.09
      ]
    },
    "longitude": {
      "type": "number",
      "format": "double",
      "minimum": -180,
      "maximum": 180,
      "description": "Longitude of the map location for the new measurement order, value between -180 and 180.",
      "examples": [
        -54.489
      ]
    },
    "providerMeasurementOrderId": {
      "type": "string",
      "description": "A text with the provider order identifier, special characters not allowed.",
      "minLength": 1,
      "maxLength": 40
    },
    "providerId": {
      "default": "Hover",
      "type": "string",
      "enum": [
        "Unknown",
        "Hover",
        "RoofSnap",
        "External"
      ],
      "description": "The external provider from which a measurement order comes.\n- Unknown\n- Hover\n- RoofSnap\n- External\n"
    },
    "measurementOrderDescription": {
      "type": "string",
      "description": "A text with a description of the new measurement order.",
      "minLength": 1,
      "maxLength": 500
    },
    "model3DUrl": {
      "type": "string",
      "format": "uri",
      "description": "The URL of the 3D model file.",
      "examples": [
        "https://www.acculynx.com/3DModel"
      ]
    },
    "orderedDate": {
      "type": "string",
      "format": "date-time",
      "description": "The creation DateTime for the new measurement order.\nAn ISO 8601 string of datetime including the time component and ending with 'Z' (so in UTC). \nhttps://en.wikipedia.org/wiki/ISO_8601#Coordinated_Universal_Time_(UTC)\n",
      "examples": [
        "2024-06-25T10:00:00Z"
      ]
    },
    "completedDate": {
      "type": "string",
      "format": "date-time",
      "description": "The completed DateTime for the new measurement order.\nAn ISO 8601 string of datetime including the time component and ending with 'Z' (so in UTC). \nhttps://en.wikipedia.org/wiki/ISO_8601#Coordinated_Universal_Time_(UTC)\n",
      "examples": [
        "2025-08-20T05:00:00Z"
      ]
    }
  },
  "required": [
    "latitude",
    "longitude",
    "providerMeasurementOrderId",
    "providerId",
    "measurementOrderDescription",
    "orderedDate"
  ],
  "title": "jobMeasurementsPostFiles",
  "x-readme-ref-name": "jobMeasurementsPostFiles",
  "$schema": "http://json-schema.org/draft-04/schema#"
} as const;
export default JobMeasurementsPostFiles
