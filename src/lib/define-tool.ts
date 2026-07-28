import type { z } from "zod";
import type { Approval } from "./approval.ts";
import type { CommandConfig, CommandContext } from "./define-acculynx-tool.ts";

interface RawToolConfig<TSchema extends z.ZodType<Record<string, unknown>>> {
  description: string;
  inputSchema: TSchema;
  approval?: Approval;
  execute: (
    input: z.output<TSchema>,
    ctx: CommandContext,
  ) => Promise<{ text: string; data: Record<string, unknown> }>;
  toModelOutput?: (output: { text: string }) => unknown;
}

/**
 * Compat shim for eve's raw defineTool. Raw tools ran formatToolResponse
 * themselves; we unwrap `.data` (the structured record) and let the CLI's
 * output pipeline re-format. Arrays come back as { payload: [...] } per
 * formatToolResponse's structuredRecord rule — acceptable and documented.
 */
export function defineTool<TSchema extends z.ZodType<Record<string, unknown>>>(
  config: RawToolConfig<TSchema>,
): CommandConfig {
  return {
    description: config.description,
    inputSchema: config.inputSchema as unknown as z.ZodType<Record<string, unknown>>,
    ...(config.approval !== undefined && { approval: config.approval }),
    call: async (_client, input, ctx) => {
      const result = await config.execute(input as z.output<TSchema>, ctx);
      return result.data;
    },
  };
}
