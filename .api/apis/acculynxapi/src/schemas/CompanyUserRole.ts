const CompanyUserRole = {
  "type": "object",
  "title": "companyUserRole",
  "x-readme-ref-name": "companyUserRole",
  "properties": {
    "id": {
      "type": "integer",
      "description": "The id/enum value of the user role.",
      "examples": [
        3
      ]
    },
    "name": {
      "type": "string",
      "enum": [
        "Company Administrator",
        "Location Administrator",
        "Manager",
        "Office",
        "Sales",
        "Crew"
      ],
      "description": "The name of the role.\n\n`Company Administrator` `Location Administrator` `Manager` `Office` `Sales` `Crew`",
      "examples": [
        "Manager"
      ]
    }
  }
} as const;
export default CompanyUserRole
