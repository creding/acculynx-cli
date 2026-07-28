const PhoneNumber = {
  "title": "phoneNumber",
  "x-readme-ref-name": "phoneNumber",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "The GUID of the Phone Number.",
      "format": "uuid",
      "readOnly": true,
      "examples": [
        "b2830ef6-c5ff-44ca-a3b9-aa767f50a04b"
      ]
    },
    "_link": {
      "type": "string",
      "description": "The URI of the Phone Number.",
      "readOnly": true,
      "examples": [
        "https://api.acculynx.com/api/v2/contacts/7f008cca-9789-44c3-afdf-7ec2e005c267/phone-numbers/b2830ef6-c5ff-44ca-a3b9-aa767f50a04b"
      ]
    },
    "number": {
      "type": "string",
      "description": "10 digit phone number.",
      "minLength": 10,
      "maxLength": 10,
      "pattern": "^\\d{10}$"
    },
    "ext": {
      "type": "string"
    },
    "type": {
      "description": "The type or classification of the phone number. Determines the primary use case for this contact method.\n\n`Home` `Mobile` `Work`",
      "type": "string",
      "enum": [
        "Home",
        "Mobile",
        "Work"
      ],
      "default": "Home",
      "examples": [
        "Home"
      ]
    },
    "primary": {
      "type": "boolean",
      "description": "Is this phone number the primary phone number for the related entity?",
      "readOnly": true
    },
    "smsOptOut": {
      "type": [
        "boolean",
        "null"
      ],
      "description": "This value specifies if SMS messaging is active for this contact number."
    }
  }
} as const;
export default PhoneNumber
