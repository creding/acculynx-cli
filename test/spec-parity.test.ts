import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";

/**
 * Guards against the add-expense bug class: a command's hand-written Zod schema
 * omitting a field the AccuLynx API accepts. validateInput strips unknown keys,
 * so an omitted field is silently dropped — the caller "sent" it, the API never
 * saw it, and the error (if any) blames the caller. Every command's declared
 * body must be a superset of the spec's request-body properties.
 *
 * Scope: presence and maxLength ceilings only — the axes where this spec is
 * reliable. `required` arrays and nullability are deliberately NOT compared:
 * the spec is demonstrably wrong there (expense paymentDate is nullable:true
 * in the spec yet the API 400s without it — "PaymentDate cannot be null or
 * empty"), and its required arrays are near-empty across the board, so most
 * mutating commands are legitimately stricter than spec. Schemas may exceed
 * the spec (extra required fields, format patterns, tighter caps); deliberate
 * overrides are pinned behaviorally in commands.test.ts and explained by
 * comments at the field they affect.
 */

const ROOT = process.cwd();
const SPEC_PATH = path.join(ROOT, "node_modules/@api/acculynxapi/openapi.json");
const COMMANDS_DIR = path.join(ROOT, "src/commands");

/**
 * Operations whose request body is hand-built inside call() with remapped
 * input keys, so the input schema legitimately differs from the spec body.
 * Their wiring is covered behaviorally in commands.test.ts.
 */
const REMAPPED_OPS: Record<string, string[]> = {
  // create_job's secondary assignment calls take {id} built from *OwnerIds arrays.
  "acculynx_create_job.ts": ["postSalesOwnerForJob", "postCompanyRepresentativeForJob", "postAROwnerForJob"],
  // leadSourceId input is remapped to the spec body's {id}.
  "acculynx_update_job_lead_source.ts": ["updateJobLeadSource"],
};

interface SpecBody {
  props: Record<string, any>;
  path: string;
  method: string;
}

function loadSpecBodies(): Map<string, SpecBody> {
  const spec = JSON.parse(fs.readFileSync(SPEC_PATH, "utf8"));
  const out = new Map<string, SpecBody>();
  for (const [p, methods] of Object.entries<any>(spec.paths)) {
    for (const [method, m] of Object.entries<any>(methods)) {
      if (!m || typeof m !== "object" || !m.operationId) continue;
      const content = m.requestBody?.content ?? {};
      const schema = content["application/json"]?.schema ?? content["multipart/form-data"]?.schema;
      if (schema?.properties) out.set(m.operationId, { props: schema.properties, path: p, method });
    }
  }
  return out;
}

/** The command's declared body properties: its `body` object when present, else top level. */
function declaredBodyProps(jsonSchema: any): Record<string, any> {
  const bodyProp = jsonSchema.properties?.body;
  return (
    bodyProp?.properties ??
    bodyProp?.anyOf?.find((v: any) => v.properties)?.properties ??
    jsonSchema.properties ??
    {}
  );
}

function maxLengthOf(prop: any): number | undefined {
  return prop?.maxLength ?? prop?.anyOf?.find((v: any) => v.maxLength !== undefined)?.maxLength;
}

test("every command declares every spec request-body field (none silently stripped)", async () => {
  const specBodies = loadSpecBodies();
  const files = fs.readdirSync(COMMANDS_DIR).filter((f) => f.endsWith(".ts"));
  assert.ok(files.length > 100, `expected the full command set, found ${files.length}`);

  const missingReport: string[] = [];
  const lengthReport: string[] = [];
  for (const file of files) {
    const src = fs.readFileSync(path.join(COMMANDS_DIR, file), "utf8");
    const ops = [...new Set([...src.matchAll(/client\.(\w+)\(/g)].map((m) => m[1]))];
    const mod = await import(path.join(COMMANDS_DIR, file));
    const jsonSchema = z.toJSONSchema(mod.default.inputSchema, { io: "input", unrepresentable: "any" }) as any;
    const declared = declaredBodyProps(jsonSchema);

    for (const op of ops) {
      if (REMAPPED_OPS[file]?.includes(op)) continue;
      const specBody = specBodies.get(op);
      if (!specBody) continue;
      const missing = Object.keys(specBody.props).filter((k) => !(k in declared));
      if (missing.length) {
        missingReport.push(
          `${file} (${op}: ${specBody.method.toUpperCase()} ${specBody.path}) is missing: ${missing.join(", ")}`,
        );
      }
      for (const [key, specProp] of Object.entries<any>(specBody.props)) {
        if (specProp.maxLength === undefined || !(key in declared)) continue;
        const declaredMax = maxLengthOf(declared[key]);
        if (declaredMax === undefined || declaredMax > specProp.maxLength) {
          lengthReport.push(
            `${file} (${op}): "${key}" needs maxLength ≤ ${specProp.maxLength} (declared: ${declaredMax ?? "none"})`,
          );
        }
      }
    }
  }

  assert.deepEqual(missingReport, [], `Schemas drop fields the API accepts:\n${missingReport.join("\n")}`);
  assert.deepEqual(
    lengthReport,
    [],
    `String fields missing the spec's maxLength (callers get a wasted 400 round-trip):\n${lengthReport.join("\n")}`,
  );
});
