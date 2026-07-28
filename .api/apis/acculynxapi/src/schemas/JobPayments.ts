import AdditionalExpenses from './AdditionalExpenses.js';
import PaidPayments from './PaidPayments.js';
import ReceivedPayments from './ReceivedPayments.js';

const JobPayments = {
  "type": "object",
  "description": "All payment records for the job, organized by payment category.",
  "properties": {
    "paidPayments": PaidPayments,
    "receivedPayments": ReceivedPayments,
    "additionalExpenses": AdditionalExpenses
  },
  "title": "jobPayments",
  "x-readme-ref-name": "jobPayments",
  "$schema": "http://json-schema.org/draft-04/schema#"
} as const;
export default JobPayments
