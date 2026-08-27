import { test } from "node:test";
import assert from "node:assert/strict";
import addExpense from "../src/commands/acculynx_post_create_payment_additional_expense.ts";
import addPaid from "../src/commands/acculynx_post_create_payment_paid.ts";
import addReceived from "../src/commands/acculynx_create_payment_received.ts";
import setInitialAppointment from "../src/commands/acculynx_set_initial_appointment.ts";
import updateJobLeadSource from "../src/commands/acculynx_update_job_lead_source.ts";
import createJobMessage from "../src/commands/acculynx_create_job_message.ts";
import addContactLog from "../src/commands/acculynx_add_contact_log.ts";
import createContact from "../src/commands/acculynx_create_contact.ts";
import getContacts from "../src/commands/acculynx_get_contacts.ts";
import getJobs from "../src/commands/acculynx_get_jobs.ts";
import { findEntry } from "../src/registry.ts";
import { introspect } from "../src/lib/schema-to-flags.ts";
import { makeExample } from "../src/lib/run-command.ts";

const UUID = "3fa85f64-5717-4562-b3fc-2c963f66afa6";
const ISO = "2026-08-27T00:00:00Z";

/** Records every SDK method call and resolves it with the given data. */
function mockClient(data: unknown) {
  const calls: Array<{ method: string; args: any[] }> = [];
  const client = new Proxy(
    {},
    {
      get: (_t, prop) => (...args: any[]) => {
        calls.push({ method: String(prop), args });
        return Promise.resolve({ data });
      },
    },
  ) as any;
  return { client, calls };
}

// --- payments add-expense: the reported bug -------------------------------

test("add-expense: paymentDate is declared and required; paymentMethod accepted", () => {
  const ok = addExpense.inputSchema.safeParse({
    jobId: UUID,
    body: { to: "Vendor", amount: 171.81, paymentDate: ISO, paymentMethod: "Check" },
  });
  assert.ok(ok.success, JSON.stringify((ok as any).error?.issues));
  assert.equal((ok.data as any).body.paymentDate, ISO);
  assert.equal((ok.data as any).body.paymentMethod, "Check");

  const missing = addExpense.inputSchema.safeParse({ jobId: UUID, body: { to: "Vendor", amount: 1 } });
  assert.ok(!missing.success, "paymentDate must be required — the API rejects requests without it");
  assert.ok(missing.error!.issues.some((i) => i.path.join(".") === "body.paymentDate"));
});

test("add-expense: malformed paymentDate fails client-side, not as an API 400", () => {
  const r = addExpense.inputSchema.safeParse({ jobId: UUID, body: { amount: 1, paymentDate: "banana" } });
  assert.ok(!r.success);
  assert.ok(r.error!.issues.some((i) => i.path.join(".") === "body.paymentDate"));
});

test("add-paid: paymentDate gets the same ISO validation as add-expense but stays optional", () => {
  const bad = addPaid.inputSchema.safeParse({ jobId: UUID, body: { amount: 1, paymentDate: "banana" } });
  assert.ok(!bad.success, "malformed dates must fail client-side, not as an API 400");
  assert.ok(bad.error!.issues.some((i) => i.path.join(".") === "body.paymentDate"));

  const dateOnly = addPaid.inputSchema.safeParse({ jobId: UUID, body: { paymentDate: "2026-08-27" } });
  assert.ok(!dateOnly.success, "the documented contract is a Z-suffixed ISO datetime");

  const ok = addPaid.inputSchema.safeParse({ jobId: UUID, body: { amount: 1, paymentDate: ISO } });
  assert.ok(ok.success, JSON.stringify((ok as any).error?.issues));

  const omitted = addPaid.inputSchema.safeParse({ jobId: UUID, body: { amount: 1 } });
  assert.ok(omitted.success, "paymentDate remains optional on add-paid — the API does not hard-require it there");
});

test("add-expense: call forwards the body with paymentDate to the SDK", async () => {
  const { client, calls } = mockClient({ id: "pay-1" });
  const body = { to: "Vendor", amount: 171.81, paymentDate: ISO, isPaid: true };
  const result = await addExpense.call(client, { jobId: UUID, body }, {} as any);
  assert.equal(calls[0].method, "postCreatePaymentAdditionalExpense");
  assert.deepEqual(calls[0].args[0], body);
  assert.deepEqual(calls[0].args[1], { jobId: UUID });
  assert.deepEqual(result, { id: "pay-1" });
});

test("add-expense describe example includes a valid paymentDate", () => {
  const entry = findEntry("payments", "add-expense")!;
  const example = makeExample(entry, introspect(entry.config.inputSchema));
  assert.match(example, /paymentDate/);
  assert.match(example, /\d{4}-\d{2}-\d{2}T[\d:.]+Z/);
});

// --- undocumented API caps enforced client-side ---------------------------

test("payments notes over 250 chars fail client-side on expense, paid, and received", () => {
  const notes = "x".repeat(251);
  assert.ok(!addExpense.inputSchema.safeParse({ jobId: UUID, body: { paymentDate: ISO, notes } }).success);
  assert.ok(!addPaid.inputSchema.safeParse({ jobId: UUID, body: { notes } }).success);
  assert.ok(!addReceived.inputSchema.safeParse({ jobId: UUID, amount: 1, paymentDate: "2026-08-27", notes }).success);
});

// --- payments add-received: missing paymentMethod -------------------------

test("add-received: paymentMethod is accepted and threaded into the request body", async () => {
  const parsed = addReceived.inputSchema.safeParse({
    jobId: UUID,
    amount: 5,
    paymentDate: "2026-08-27",
    paymentMethod: "Credit Card",
  });
  assert.ok(parsed.success, JSON.stringify((parsed as any).error?.issues));
  const { client, calls } = mockClient({ id: "pay-2" });
  const result = await addReceived.call(client, parsed.data as any, {} as any);
  assert.equal(calls[0].method, "postCreatePaymentReceived");
  assert.equal(calls[0].args[0].paymentMethod, "Credit Card");
  assert.deepEqual(result, { id: "pay-2" });
});

// --- comma-operator returns: mutations must report their result -----------

const RETURNING_COMMANDS: Array<[string, { call: Function }, Record<string, unknown>]> = [
  ["payments add-received", addReceived, { jobId: UUID, amount: 1, paymentDate: "2026-08-27" }],
  ["jobs set-initial-appointment", setInitialAppointment, { jobId: UUID, startDate: ISO }],
  ["jobs set-lead-source", updateJobLeadSource, { jobId: UUID, leadSourceId: UUID }],
  ["jobs add-message", createJobMessage, { jobId: UUID, message: "hello" }],
  ["contacts add-log", addContactLog, { contactId: UUID, logDate: ISO, type: "PhoneCall" }],
];

test("mutating commands return the API payload instead of undefined", async () => {
  for (const [name, cfg, input] of RETURNING_COMMANDS) {
    const { client } = mockClient({ id: "created-1" });
    const result = await cfg.call(client, input, {});
    assert.deepEqual(result, { id: "created-1" }, `${name} must surface the API response`);
  }
});

test("mutating commands return the success fallback when the API sends no body", async () => {
  for (const [name, cfg, input] of RETURNING_COMMANDS) {
    const { client } = mockClient(null);
    const result = (await cfg.call(client, input, {})) as any;
    assert.ok(result && result.success === true, `${name} must return the fallback object, got: ${result}`);
  }
});

// --- contacts create: address fields were silently stripped ---------------

test("contacts create: mailing/billing address and profile fields survive parsing", () => {
  const r = createContact.inputSchema.safeParse({
    firstName: "Ada",
    mailingAddress: {
      street1: "123 Main St.",
      city: "Peoria",
      zipCode: "61603",
      state: { id: 43 },
      country: { id: 1 },
    },
    billingAddressSameAsMailingAddress: true,
    companyJobTitle: "Owner",
    crossReference: "XR-1",
  });
  assert.ok(r.success, JSON.stringify((r as any).error?.issues));
  const data = r.data as any;
  assert.equal(data.mailingAddress.street1, "123 Main St.");
  assert.equal(data.mailingAddress.state.id, 43);
  assert.equal(data.billingAddressSameAsMailingAddress, true);
  assert.equal(data.companyJobTitle, "Owner");
  assert.equal(data.crossReference, "XR-1");
});

// --- contacts list: search filters existed in the API but not the schema --

test("contacts list: search threads contactTypes, dates, and sort into the body", async () => {
  const { client, calls } = mockClient({ items: [] });
  await getContacts.call(
    client,
    {
      searchTerm: "smith",
      contactTypes: ["Customer"],
      startDate: "2026-01-01T00:00:00Z",
      endDate: "2026-02-01T00:00:00Z",
      sort: { sortColumn: "CreatedDate", sortDirection: "Descending" },
    },
    {} as any,
  );
  assert.equal(calls[0].method, "postContactSearch");
  const body = calls[0].args[0];
  assert.deepEqual(body.contactTypes, ["Customer"]);
  assert.equal(body.startDate, "2026-01-01T00:00:00Z");
  assert.equal(body.endDate, "2026-02-01T00:00:00Z");
  assert.deepEqual(body.sort, { sortColumn: "CreatedDate", sortDirection: "Descending" });
});

test("contacts list: search defaults are unchanged when the new filters are omitted", async () => {
  const { client, calls } = mockClient({ items: [] });
  await getContacts.call(client, { searchTerm: "smith" }, {} as any);
  const body = calls[0].args[0];
  assert.equal(body.searchTerm, "smith");
  assert.equal(body.startDate, "1970-01-01");
  assert.equal(body.endDate, "2050-01-01");
  assert.deepEqual(body.sort, { sortColumn: "lastName", sortDirection: "Ascending" });
});

// --- jobs list: geoLocation search --------------------------------------

test("jobs list: geoLocation routes to search and reaches the request body", async () => {
  const { client, calls } = mockClient({ items: [] });
  await getJobs.call(client, { geoLocation: { latitude: 40.689, longitude: -74.044, mapRadius: 2 } }, {} as any);
  assert.equal(calls[0].method, "searchJobs");
  assert.deepEqual(calls[0].args[0].geoLocation, { latitude: 40.689, longitude: -74.044, mapRadius: 2 });
});
