/**
 * Company identity used on generated documents (COC, roof report, letterhead).
 * Values come from environment variables so the app can be redeployed for a
 * different organization or signer without code changes; the defaults preserve
 * the current Patriot Roofing configuration.
 */
const env = (name: string, fallback: string): string => process.env[name]?.trim() || fallback;

export const COMPANY = {
  name: env("COMPANY_LEGAL_NAME", "Patriot Roofing and Builders LLC"),
  addressLine1: env("COMPANY_ADDRESS_LINE1", "5131 English Turn"),
  addressLine2: env("COMPANY_ADDRESS_LINE2", "Birmingham AL 35242"),
  phone: env("COMPANY_PHONE", "205-559-0298"),
  licenseNumber: env("COMPANY_LICENSE_NUMBER", "ALHB#31867"),
} as const;

/** Default signer for Certificates of Completion. */
export const COC_SIGNER = {
  name: env("COC_SIGNER_NAME", "Justin Johnson"),
  title: env("COC_SIGNER_TITLE", "President of operations"),
  email: env("COC_SIGNER_EMAIL", "justin@patriot-roof.com"),
  phone: env("COC_SIGNER_PHONE", "205-559-0298"),
  secondPhone: env("COC_SIGNER_SECOND_PHONE", "205-919-4494"),
} as const;

/** Default inspector/signer for roof reports. */
export const REPORT_SIGNER = {
  name: env("REPORT_SIGNER_NAME", "Chris Reding"),
  title: env("REPORT_SIGNER_TITLE", COMPANY.name),
  email: env("REPORT_SIGNER_EMAIL", "chris@patriot-roof.com"),
  phone: env("REPORT_SIGNER_PHONE", "(205) 500-1113"),
} as const;
