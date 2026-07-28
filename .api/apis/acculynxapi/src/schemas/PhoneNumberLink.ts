const PhoneNumberLink = {
  "type": "object",
  "title": "phoneNumberLink",
  "x-readme-ref-name": "phoneNumberLink",
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
    }
  }
} as const;
export default PhoneNumberLink
