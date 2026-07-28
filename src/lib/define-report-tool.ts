import { z } from "zod";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { LetterheadDocument } from "./pdf.ts";
import { resolveSigner, type SignerInfo } from "./signer.ts";
import { defineAcculynxTool, type CommandConfig } from "./define-acculynx-tool.ts";
import { LOGO_DRAFT_COC, LOGO_ROOF_REPORT } from "./logo-assets.ts";

/**
 * # Report command factory (CLI port of patriot-agent's defineReportTool)
 *
 * Every generated document (COC, roof report) follows the same
 * **review-then-upload** contract: the generate command is rendering-only —
 * it draws the PDF, writes it to disk (-o/--output or a derived filename in
 * the cwd), and returns file metadata. The caller shows the PDF to the user
 * and uploads only after confirmation via `acculynx documents add`.
 *
 * Signature resolution (signer.ts): explicit signer* input overrides →
 * ACCULYNX_SIGNER_EMAIL matched against AccuLynx users → configured defaults
 * from company.ts.
 */
export interface ReportToolConfig<TSchema extends z.ZodObject<z.ZodRawShape>> {
  /** Human-readable document name, e.g. "Certificate of Completion". */
  documentType: string;
  description: string;
  /** Asset folder name whose logo.png brands the letterhead. */
  skillName: string;
  /** Name of the AccuLynx document folder this report belongs in ("Other" is the fallback). */
  uploadFolder: string;
  /** File name suffix: `<slug>-<fileSuffix>.pdf`. */
  fileSuffix: string;
  /** Zod object schema for the report's inputs. Must include `jobId`. Signer override fields are appended automatically. */
  inputSchema: TSchema;
  /** Fallback signature block (from company.ts) when no AccuLynx profile matches. */
  signerDefaults: SignerInfo;
  /** Names the file, e.g. the customer or recipient name. Falls back to jobId when it slugs to nothing. */
  slugSource: (input: z.output<TSchema>) => string;
  /** Draws the document body. Letterhead, pagination, and page numbers are already handled. */
  render: (doc: LetterheadDocument, input: z.output<TSchema>, signer: SignerInfo) => void | Promise<void>;
  /** Optional extra fields merged into the command's output (e.g. computed totals). */
  summaryData?: (input: z.output<TSchema>) => Record<string, unknown>;
}

/** Embedded letterhead logos (generated from assets/, see logo-assets.ts). */
const LOGOS: Record<string, Uint8Array> = {
  "draft-coc": LOGO_DRAFT_COC,
  "generate-roof-report": LOGO_ROOF_REPORT,
};

/** Optional per-call signer overrides appended to every report schema. */
const SIGNER_OVERRIDE_FIELDS = {
  signerName: z.string().optional().describe(
    "Override the signer name. Defaults to the configured signer (ACCULYNX_SIGNER_EMAIL) matched against AccuLynx users, then company configuration — only pass this when the user explicitly asks to sign as someone else.",
  ),
  signerTitle: z.string().optional().describe("Override the signer's business title line."),
  signerEmail: z.string().optional().describe("Override the signer email."),
  signerPhone: z.string().optional().describe("Override the signer phone number."),
  signerSecondPhone: z.string().optional().describe("Override the second signer phone line."),
};

export function defineReportTool<TSchema extends z.ZodObject<z.ZodRawShape>>(
  config: ReportToolConfig<TSchema>,
): CommandConfig {
  return defineAcculynxTool({
    description:
      `${config.description} Rendering only — nothing is sent anywhere; writes the PDF to disk (-o/--output or a derived name in the cwd) for the user to review. ` +
      `Upload to AccuLynx is a separate step (acculynx documents add) run only after the user confirms the document.`,
    inputSchema: config.inputSchema.extend(SIGNER_OVERRIDE_FIELDS) as unknown as z.ZodType<Record<string, unknown>>,
    async call(_client, rawInput, ctx) {
      const input = rawInput as z.output<TSchema> & {
        jobId: string;
        signerName?: string;
        signerTitle?: string;
        signerEmail?: string;
        signerPhone?: string;
        signerSecondPhone?: string;
      };
      try {
        const signer = await resolveSigner(ctx, config.signerDefaults, {
          name: input.signerName,
          title: input.signerTitle,
          email: input.signerEmail,
          phone: input.signerPhone,
          secondPhone: input.signerSecondPhone,
        });
        // Brand the letterhead with the bundled logo asset; a missing asset
        // falls back to the text logotype rather than failing the report.
        const logoBytes: Uint8Array | undefined = LOGOS[config.skillName];

        const doc = await LetterheadDocument.create({ logoBytes });
        await config.render(doc, input, signer);
        const pdfBytes = await doc.finalize();

        let slug = config
          .slugSource(input)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        if (!slug) slug = input.jobId;
        const fileName = `${slug}-${config.fileSuffix}.pdf`;
        const filePath = path.resolve(ctx.outputPath ?? fileName);
        await writeFile(filePath, Buffer.from(pdfBytes));

        return {
          success: true,
          documentType: config.documentType,
          fileName,
          filePath,
          signedBy: signer.name,
          uploadFolder: config.uploadFolder,
          ...config.summaryData?.(input),
        };
      } catch (error) {
        throw new Error(
          `Failed to generate ${config.documentType} PDF: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    },
  });
}
