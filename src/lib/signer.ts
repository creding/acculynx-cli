import { getAccuLynxClient } from "./acculynx.ts";

/**
 * # Report signer resolution
 *
 * AccuLynx has no "email signature" resource, so reports build the signature
 * block from the signed-in user's AccuLynx profile. Resolution chain, first
 * match wins per field:
 *
 *  1. **Explicit tool input** — the model passes overrides when the user asks
 *     ("sign it as Justin").
 *  2. **The current user's AccuLynx profile** — the eve channel authenticates
 *     every request with Supabase, so `ctx.session.auth` carries the caller's
 *     email; we match it (case-insensitively) against the company's AccuLynx
 *     users and use their displayName / email / phone / mobilePhone.
 *  3. **Configured defaults** — the per-report signer in company.ts
 *     (env-overridable), also used when the caller has no AccuLynx account
 *     (e.g. local dev without a bearer token).
 *
 * The title is intentionally NOT taken from the AccuLynx role (roles like
 * "CompanyAdmin" don't belong on customer-facing documents): the configured
 * default title applies only when the resolved signer IS the configured
 * default person; otherwise the title line is omitted unless explicitly
 * provided.
 */
export interface SignerInfo {
  name: string;
  /** Business title printed under the name; empty string omits the line. */
  title: string;
  email: string;
  phone: string;
  /** Optional second phone line (e.g. office + mobile). */
  secondPhone?: string;
}

export type SignerOverrides = Partial<SignerInfo>;

interface AccuLynxUser {
  displayName?: string;
  email?: string;
  phone?: string;
  mobilePhone?: string;
  status?: string;
}

// One lookup per email per process; the company user list changes rarely.
const userCache = new Map<string, AccuLynxUser | null>();

/** Formats a bare 10-digit number as (205) 500-1113; returns others unchanged. */
function formatPhone(raw: string | undefined): string {
  if (!raw) return "";
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return raw;
}

async function findAcculynxUserByEmail(email: string): Promise<AccuLynxUser | null> {
  const key = email.toLowerCase();
  if (userCache.has(key)) return userCache.get(key) ?? null;

  let found: AccuLynxUser | null = null;
  try {
    const client = getAccuLynxClient();
    // Company user lists are small; scan up to 100 users to be safe.
    for (let startIndex = 0; startIndex < 100; startIndex += 25) {
      const res = await client.getUsers({ pageSize: 25, pageStartIndex: startIndex });
      const items: AccuLynxUser[] = res.data?.items ?? [];
      found = items.find((u) => u.email?.toLowerCase() === key) ?? null;
      if (found || items.length < 25) break;
    }
  } catch (err) {
    console.warn("[signer] AccuLynx user lookup failed; using configured defaults:", err);
  }
  userCache.set(key, found);
  return found;
}

/** CLI: the "session" identity is the configured signer email. */
function sessionEmail(_ctx: any): string | null {
  const email = process.env.ACCULYNX_SIGNER_EMAIL;
  return typeof email === "string" && email.includes("@") ? email : null;
}

/**
 * Resolves the signature block for a report. See the module doc for the
 * resolution chain. Never throws — a failed lookup falls back to defaults.
 */
export async function resolveSigner(
  ctx: any,
  defaults: SignerInfo,
  overrides: SignerOverrides = {},
): Promise<SignerInfo> {
  const email = sessionEmail(ctx);
  const profile = email ? await findAcculynxUserByEmail(email) : null;

  if (!profile) {
    return { ...defaults, ...stripUndefined(overrides) };
  }

  const isDefaultPerson = profile.email?.toLowerCase() === defaults.email.toLowerCase();
  const primaryPhone = formatPhone(profile.phone || profile.mobilePhone);
  const mobile = formatPhone(profile.mobilePhone);
  const secondPhone = mobile && mobile !== primaryPhone ? mobile : undefined;

  const fromProfile: SignerInfo = {
    name: profile.displayName || defaults.name,
    title: isDefaultPerson ? defaults.title : "",
    email: profile.email || defaults.email,
    // Never borrow another person's phone number: a profile without one
    // yields an empty phone, and renders skip the line.
    phone: primaryPhone || (isDefaultPerson ? defaults.phone : ""),
    secondPhone: secondPhone ?? (isDefaultPerson ? defaults.secondPhone : undefined),
  };
  return { ...fromProfile, ...stripUndefined(overrides) };
}

function stripUndefined<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== ""),
  ) as Partial<T>;
}
