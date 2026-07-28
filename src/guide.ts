export const GUIDE = `# AccuLynx CLI — operational primer

Discovery-first workflow: \`acculynx --help\` (groups) → \`acculynx <group> --help\` (commands)
→ \`acculynx describe <group> <command>\` (schema + example) → run it.
\`acculynx search <keyword>\` finds commands by intent. Output is JSON; errors are JSON on stderr.

## Domain model
- **Job**: the primary entity for any project or prospective work order. (Not "project"/"deal".)
- **Lead**: a Job in the "Lead (Unassigned)" milestone — not a separate record type.
- **Contact**: the customer/owner. Every Job references exactly one Contact at creation.

## Creating a job (multi-step, always in this order)
1. Find the contact: \`acculynx contacts list --search-term "<name>"\`. If a match exists, ASK THE USER
   whether to reuse it before creating a duplicate. Else \`acculynx contacts create\`
   (contactTypeIds are UUIDs from \`acculynx contacts types\`; jobCategory/workType ids are numeric).
2. Discover reference ids as needed: \`acculynx settings lead-sources|job-categories|work-types|trade-types\`,
   \`acculynx users list\`.
3. \`acculynx jobs create --json '{"contact":{"id":"..."}, ...}'\`. If the user hasn't named an assignee,
   ASK before assigning. New leads may only get companyRepresentativeIds — salesOwnerIds/arOwnerIds
   require the Approved milestone. Inspect assignmentErrors in the result before claiming success.

## Searching jobs — two mutually exclusive modes
- \`--search-term "<term>"\`: global search by street/customer/job-number. ALL other filters are ignored.
- No \`--search-term\`: filtered listing. sortOrder defaults to Ascending, so "latest N" needs
  \`--sort-by CreatedDate --sort-order Descending --page-size N\`. Milestone names must come from
  \`acculynx settings milestones\` (never guess). Date windows: --start-date/--end-date + --date-filter-type.
- Jobs assigned to a user: \`acculynx jobs list-by-user\` (bounded scan; report truncatedScan: true honestly).

## Hard API limits (do not fight these)
- pageSize max is 25 everywhere; paginate with recordStartIndex/pageStartIndex.
- No endpoint changes a job's milestone/status; no delete for jobs/contacts; no reading message threads
  (posting/replying only). Say "not supported" instead of inventing commands.
- Production schedules/work orders have no REST resource: \`acculynx jobs production-schedule <jobId>\`
  parses the job's recent history events (latest 50 only — say so if incomplete).
- Initial appointments live on the job (\`acculynx jobs initial-appointment\`), NOT on company calendars.
  Calendars: appointments calendars → appointments list (calendarId + date window) → appointments get.

## Financials
Use the job-scoped commands: \`acculynx financials for-job <jobId>\` (contract totals/worksheets),
\`acculynx estimates list-for-job <jobId>\`, \`acculynx invoices list-for-job <jobId>\`,
\`acculynx payments for-job <jobId>\`. Never guess external ledger ids.

## Documents & reports
Upload: resolve folder UUID via \`acculynx documents folders\`, then \`acculynx documents add\`.
PDF generation: \`acculynx reports coc\` / \`acculynx reports roof-report\` write a PDF locally
(-o path) for user review; upload AFTER the user confirms, to the "Certificate of Completion" /
"Roof Report" folder (fallback "Other").

## Conduct
- Mutating commands are labeled [mutates] — confirm details (amounts, dates, recipients) with the
  user before running them, and report the real result including errors.
- Never present a raw UUID to a user — resolve it (contacts get, users get, jobs get) first.
- Truncated output ends with a truncation marker: narrow the query; don't assume the data ended.
- Transient failures already retried (429/5xx); a surfaced error is persistent — don't blind-retry.
`;
