/** Bad invocation (unknown command, bad flags, malformed JSON). Exit 2. */
export class UsageError extends Error {
  suggestion?: string;
  constructor(message: string, suggestion?: string) {
    super(message);
    this.suggestion = suggestion;
  }
}

/** Schema validation failure: carries the issues plus a schema replay so the retry needs no extra lookup. Exit 2. */
export class ValidationError extends Error {
  constructor(
    public command: string,
    public issues: Array<{ path: string; message: string }>,
    public schemaReplay: unknown,
    public example: string,
  ) {
    super(`Invalid input for ${command}`);
  }
}
