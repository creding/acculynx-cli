import { z } from "zod";

export interface FlagSpec {
  key: string;
  flag: string;
  type: "string" | "number" | "boolean";
  enumValues?: string[];
  required: boolean;
  description: string;
}

export interface JsonFieldSpec {
  key: string;
  required: boolean;
  description: string;
}

export interface CommandShape {
  flags: FlagSpec[];
  jsonFields: JsonFieldSpec[];
  jsonSchema: Record<string, any>;
}

export function kebab(key: string): string {
  return key.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

/** Unwraps anyOf/oneOf nullable wrappers to the first concrete variant. */
function unwrap(p: any): any {
  if (p?.anyOf) return p.anyOf.find((v: any) => v.type !== "null") ?? p.anyOf[0];
  if (p?.oneOf) return p.oneOf.find((v: any) => v.type !== "null") ?? p.oneOf[0];
  return p ?? {};
}

export function introspect(schema: z.ZodType): CommandShape {
  const jsonSchema = z.toJSONSchema(schema, { io: "input", unrepresentable: "any" }) as Record<string, any>;
  const props: Record<string, any> = jsonSchema.properties ?? {};
  const required = new Set<string>((jsonSchema.required as string[]) ?? []);
  const flags: FlagSpec[] = [];
  const jsonFields: JsonFieldSpec[] = [];
  for (const [key, raw] of Object.entries(props)) {
    if (key === "response_format") continue; // global --format supplies this
    const p = unwrap(raw);
    const description: string = raw?.description ?? p.description ?? "";
    const isScalar = p.enum !== undefined || ["string", "number", "integer", "boolean"].includes(p.type);
    if (isScalar) {
      flags.push({
        key,
        flag: kebab(key),
        type: p.type === "boolean" ? "boolean" : p.type === "number" || p.type === "integer" ? "number" : "string",
        ...(p.enum !== undefined && { enumValues: (p.enum as unknown[]).map(String) }),
        required: required.has(key),
        description,
      });
    } else {
      jsonFields.push({ key, required: required.has(key), description });
    }
  }
  return { flags, jsonFields, jsonSchema };
}
