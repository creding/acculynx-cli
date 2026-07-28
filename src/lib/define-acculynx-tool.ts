import type { z } from "zod";
import type { Approval } from "./approval.ts";

export interface CommandContext {
  /** Output path for report commands (-o/--output). */
  outputPath?: string;
}

export interface CommandConfig<
  TSchema extends z.ZodType<Record<string, unknown>> = z.ZodType<Record<string, unknown>>,
> {
  description: string;
  inputSchema: TSchema;
  approval?: Approval;
  call: (client: any, input: z.output<TSchema>, ctx: CommandContext) => Promise<unknown>;
}

/** Identity factory: ported tool files stay source-compatible with patriot-agent. */
export function defineAcculynxTool<TSchema extends z.ZodType<Record<string, unknown>>>(
  config: CommandConfig<TSchema>,
): CommandConfig {
  return config as unknown as CommandConfig;
}
