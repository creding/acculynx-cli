/** CLI stand-in for eve/tools/approval: marks a command as mutating. */
export type Approval = "always";
export const always = (): Approval => "always";
