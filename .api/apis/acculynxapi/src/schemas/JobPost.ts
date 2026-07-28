import ContactId from './ContactId.js';
import JobAddressPost from './JobAddressPost.js';
import JobCategoryPost from './JobCategoryPost.js';
import JobPriorityPost from './JobPriorityPost.js';
import LeadSourcePost from './LeadSourcePost.js';
import TradeTypePost from './TradeTypePost.js';
import WorkTypePost from './WorkTypePost.js';

const JobPost = {
  "type": "object",
  "properties": {
    "contact": ContactId,
    "leadSource": LeadSourcePost,
    "locationAddress": JobAddressPost,
    "priority": JobPriorityPost,
    "jobCategory": JobCategoryPost,
    "workType": WorkTypePost,
    "tradeTypes": {
      "type": "array",
      "items": TradeTypePost
    },
    "notes": {
      "type": "string",
      "description": "A note or remark for this new Jobs.",
      "maxLength": 1000,
      "examples": [
        "Job created for repairs at some place."
      ]
    }
  },
  "required": [
    "contact"
  ],
  "title": "jobPost",
  "x-readme-ref-name": "jobPost",
  "$schema": "http://json-schema.org/draft-04/schema#"
} as const;
export default JobPost
