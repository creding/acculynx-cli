/**
 * Generates src/registry.ts from the tool→command mapping (the plan's Task 7 table).
 * Positional rule: exactly one required field ending in "Id" → promoted to positional.
 * Run: npx tsx scripts/gen-registry.ts
 */
import fs from "node:fs";
import { introspect } from "../src/lib/schema-to-flags.ts";

// tool file basename (no .ts) → [group, verb]
const MAP: Record<string, [string, string]> = {
  acculynx_get_ping: ["misc", "ping"],
  acculynx_get_jobs: ["jobs", "list"],
  acculynx_get_job: ["jobs", "get"],
  acculynx_create_job: ["jobs", "create"],
  acculynx_get_jobs_by_assigned_user: ["jobs", "list-by-user"],
  acculynx_get_job_contacts: ["jobs", "contacts"],
  acculynx_get_job_contact: ["jobs", "contact"],
  acculynx_get_job_current_milestone: ["jobs", "current-milestone"],
  acculynx_get_job_milestone_by_id: ["jobs", "milestone"],
  acculynx_get_job_milestone_history: ["jobs", "milestone-history"],
  acculynx_get_job_status_by_id: ["jobs", "status"],
  acculynx_get_lead_history: ["jobs", "lead-history"],
  acculynx_get_job_production_schedule: ["jobs", "production-schedule"],
  acculynx_get_job_external_references: ["jobs", "external-references"],
  acculynx_post_create_job_external_reference: ["jobs", "add-external-reference"],
  acculynx_get_job_custom_fields: ["jobs", "custom-fields"],
  acculynx_get_job_custom_field_by_id: ["jobs", "custom-field"],
  acculynx_put_job_custom_fields: ["jobs", "set-custom-fields"],
  acculynx_put_job_custom_field_by_id: ["jobs", "set-custom-field"],
  acculynx_get_job_accounting_status: ["jobs", "accounting-status"],
  acculynx_get_job_adjuster: ["jobs", "adjuster"],
  acculynx_put_adjuster_for_job: ["jobs", "set-adjuster"],
  acculynx_get_job_insurance: ["jobs", "insurance"],
  acculynx_put_insurance_information_for_job: ["jobs", "set-insurance"],
  acculynx_put_insurance_company_for_job: ["jobs", "set-insurance-company"],
  acculynx_get_job_representatives: ["jobs", "representatives"],
  acculynx_get_company_representative_for_job: ["jobs", "company-rep"],
  acculynx_get_sales_owner_for_job: ["jobs", "sales-owner"],
  acculynx_get_ar_owner_for_job: ["jobs", "ar-owner"],
  acculynx_post_company_representative_for_job: ["jobs", "set-company-rep"],
  acculynx_post_sales_owner_for_job: ["jobs", "set-sales-owner"],
  acculynx_post_ar_owner_for_job: ["jobs", "set-ar-owner"],
  acculynx_delete_sales_owner_from_job: ["jobs", "remove-sales-owner"],
  acculynx_delete_ar_owner_from_job: ["jobs", "remove-ar-owner"],
  acculynx_put_job_location_address: ["jobs", "set-location"],
  acculynx_put_priority_for_job: ["jobs", "set-priority"],
  acculynx_update_job_category: ["jobs", "set-category"],
  acculynx_update_job_work_type: ["jobs", "set-work-type"],
  acculynx_update_job_trade_types: ["jobs", "set-trade-types"],
  acculynx_update_job_lead_source: ["jobs", "set-lead-source"],
  acculynx_create_job_message: ["jobs", "add-message"],
  acculynx_post_reply_job_message: ["jobs", "reply-message"],
  acculynx_get_job_initial_appointment: ["jobs", "initial-appointment"],
  acculynx_set_initial_appointment: ["jobs", "set-initial-appointment"],
  acculynx_delete_job_initial_appointment: ["jobs", "delete-initial-appointment"],
  acculynx_post_job_measurements_upload: ["jobs", "upload-measurements"],
  acculynx_post_job_measurements_upload_files: ["jobs", "upload-measurement-files"],
  acculynx_get_contacts: ["contacts", "list"],
  acculynx_get_contact: ["contacts", "get"],
  acculynx_create_contact: ["contacts", "create"],
  acculynx_get_contact_types: ["contacts", "types"],
  acculynx_add_contact_log: ["contacts", "add-log"],
  acculynx_get_contact_phone_numbers: ["contacts", "phone-numbers"],
  acculynx_get_contact_phone_number_by_id: ["contacts", "phone-number"],
  acculynx_get_contact_email_addresses: ["contacts", "email-addresses"],
  acculynx_get_contact_email_address_by_id: ["contacts", "email-address"],
  acculynx_get_contact_custom_fields: ["contacts", "custom-fields"],
  acculynx_get_contact_custom_field_by_id: ["contacts", "custom-field"],
  acculynx_put_contact_custom_fields: ["contacts", "set-custom-fields"],
  acculynx_put_contact_custom_field_by_id: ["contacts", "set-custom-field"],
  acculynx_get_estimates: ["estimates", "list"],
  acculynx_get_estimate_by_id: ["estimates", "get"],
  acculynx_get_job_estimates: ["estimates", "list-for-job"],
  acculynx_get_estimate_sections: ["estimates", "sections"],
  acculynx_get_estimate_section_by_id: ["estimates", "section"],
  acculynx_get_estimate_section_items: ["estimates", "section-items"],
  acculynx_get_estimate_section_item: ["estimates", "section-item"],
  acculynx_get_job_financials: ["financials", "for-job"],
  acculynx_get_financials_by_financial_id: ["financials", "get"],
  acculynx_get_worksheet_by_id: ["financials", "worksheet"],
  acculynx_get_worksheet_amendments_by_id: ["financials", "amendments"],
  acculynx_get_worksheet_amendment_by_id: ["financials", "amendment"],
  acculynx_post_worksheet_section_item: ["financials", "add-worksheet-item"],
  acculynx_get_financials_supplements_for_company: ["financials", "supplements"],
  acculynx_get_supplement_by_id: ["financials", "supplement"],
  acculynx_get_financials_supplement_item_collection: ["financials", "supplement-items"],
  acculynx_get_financials_supplement_notation_collection: ["financials", "supplement-notations"],
  acculynx_get_invoice: ["invoices", "get"],
  acculynx_get_job_invoices: ["invoices", "list-for-job"],
  acculynx_get_payments: ["payments", "list"],
  acculynx_get_job_payments: ["payments", "for-job"],
  acculynx_create_payment_received: ["payments", "add-received"],
  acculynx_post_create_payment_paid: ["payments", "add-paid"],
  acculynx_post_create_payment_additional_expense: ["payments", "add-expense"],
  acculynx_get_calendars: ["appointments", "calendars"],
  acculynx_get_appointments: ["appointments", "list"],
  acculynx_get_appointment: ["appointments", "get"],
  acculynx_get_company_document_folders: ["documents", "folders"],
  acculynx_add_job_document: ["documents", "add"],
  acculynx_post_upload_photo_or_video: ["media", "upload"],
  acculynx_get_photo_video_tags: ["media", "tags"],
  acculynx_get_users: ["users", "list"],
  acculynx_get_user: ["users", "get"],
  acculynx_get_company_settings: ["settings", "company"],
  acculynx_get_milestones: ["settings", "milestones"],
  acculynx_get_statuses_for_milestone: ["settings", "milestone-statuses"],
  acculynx_get_lead_sources: ["settings", "lead-sources"],
  acculynx_get_lead_source_by_id: ["settings", "lead-source"],
  acculynx_get_lead_source_child_by_id: ["settings", "lead-source-child"],
  acculynx_get_job_categories: ["settings", "job-categories"],
  acculynx_get_work_types: ["settings", "work-types"],
  acculynx_get_trade_types: ["settings", "trade-types"],
  acculynx_get_insurance_companies: ["settings", "insurance-companies"],
  acculynx_get_custom_fields: ["settings", "custom-fields"],
  acculynx_get_active_account_types: ["settings", "account-types"],
  acculynx_get_account_type_by_id: ["settings", "account-type"],
  acculynx_get_company_settings_location_settings_countries: ["settings", "countries"],
  acculynx_get_location_settings_country_states: ["settings", "country-states"],
  acculynx_get_accu_lynx_countries: ["settings", "al-countries"],
  acculynx_get_accu_lynx_country: ["settings", "al-country"],
  acculynx_get_accu_lynx_states: ["settings", "al-states"],
  acculynx_get_accu_lynx_state: ["settings", "al-state"],
  acculynx_get_units_of_measure: ["settings", "units-of-measure"],
  acculynx_get_reports_by_instance_instance_runs_by_schedule_id: ["reports", "runs"],
  acculynx_get_report_latest_instance: ["reports", "latest-run"],
  acculynx_get_report_by_instance_id: ["reports", "run"],
  acculynx_get_reports_recipients_by_instance_id: ["reports", "run-recipients"],
  acculynx_get_report_instace_recipient_by_id: ["reports", "run-recipient"],
};

const files = fs.readdirSync("src/commands").filter((f) => f.endsWith(".ts")).map((f) => f.replace(/\.ts$/, ""));
const unmapped = files.filter((f) => !MAP[f]);
if (unmapped.length) throw new Error(`Unmapped command files: ${unmapped.join(", ")}`);
const missing = Object.keys(MAP).filter((t) => !files.includes(t));
if (missing.length) throw new Error(`Mapped but missing files: ${missing.join(", ")}`);

const camel = (s: string) => s.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());

const imports: string[] = [];
const entries: string[] = [];
for (const [tool, [group, verb]] of Object.entries(MAP)) {
  const ident = camel(tool.replace(/^acculynx_/, ""));
  const mod = await import(`../src/commands/${tool}.ts`);
  const shape = introspect(mod.default.inputSchema);
  const requiredIds = shape.flags.filter((f) => f.required && /Id$/.test(f.key));
  const positional = requiredIds.length === 1 ? requiredIds[0].key : undefined;
  imports.push(`import ${ident} from "./commands/${tool}.ts";`);
  entries.push(
    `  { group: "${group}", verb: "${verb}", tool: "${tool}", config: ${ident}${positional ? `, positional: "${positional}"` : ""} },`,
  );
}

const out = `// GENERATED by scripts/gen-registry.ts — edit projections/hints in place; regen only when adding commands.
import type { CommandEntry } from "./lib/run-command.ts";
${imports.join("\n")}

export const GROUP_ORDER = [
  "jobs", "contacts", "estimates", "financials", "invoices", "payments",
  "appointments", "documents", "media", "users", "settings", "reports", "misc",
] as const;

export const REGISTRY: CommandEntry[] = [
${entries.join("\n")}
];

export function findEntry(group: string | undefined, verb: string | undefined): CommandEntry | undefined {
  return REGISTRY.find((e) => e.group === group && e.verb === verb);
}
`;
fs.writeFileSync("src/registry.ts", out);
console.log(`Wrote registry with ${entries.length} entries.`);
