import { z } from "zod";
import { COMPANY, REPORT_SIGNER } from "../lib/company.ts";
import { defineReportTool } from "../lib/define-report-tool.ts";
import type { SignerInfo } from "../lib/signer.ts";
import { formatUsd, COLOR_NAVY, COLOR_GRAY, COLOR_BLACK, type LetterheadDocument } from "../lib/pdf.ts";

const roofReportInputSchema = z.object({
  jobId: z.string().guid().describe("Target Job UUID where file will belong"),
  date: z.string().describe("Date of the inspection (e.g. 'July 2, 2026')"),
  recipientName: z.string().describe("Name of the recipient / client / realtor"),
  recipientCompany: z.string().optional().describe("Company of the recipient (e.g. 'Alabama Realty')"),
  propertyAddress: z.string().describe("Address of the property inspected"),
  roofCondition: z
    .enum(["excellent", "good", "fair", "poor", "failing"])
    .default("fair")
    .describe("Overall roof condition stated in the executive summary"),
  estimatedRemainingUsefulLife: z
    .number()
    .optional()
    .describe("Estimated remaining useful life of the roof in years. Omit for a roof at the end of its life."),
  shingleLayersCount: z.number().default(1).describe("Number of layers of shingles currently on the roof"),
  primaryMaterial: z
    .string()
    .optional()
    .describe("Primary roof covering material, e.g. '3-Tab Asphalt Shingles'"),
  primaryDefects: z
    .string()
    .optional()
    .describe(
      "One-line summary of the headline defects for the summary block, e.g. 'Significant wind damage, material degradation, failing drainage systems, and localized wood rot.'",
    ),
  executiveSummary: z
    .string()
    .optional()
    .describe(
      "The executive summary narrative, in your own words, describing overall condition and its drivers. Write this whenever the roof is not simply aging normally — a generic sentence is generated only if you omit it.",
    ),
  damages: z.array(
    z.object({
      area: z.string().describe("Area or system inspected, e.g. 'Front Porch' or 'Roof Covering System (Shingles)'"),
      description: z.string().describe("Description of identified damage and required repairs"),
      items: z
        .array(
          z.object({
            label: z.string().describe("Sub-finding name, e.g. 'Wind Damage' or 'Creased Shingles'"),
            description: z.string().describe("Detail for this specific sub-finding"),
          }),
        )
        .optional()
        .describe(
          "Itemized sub-findings within this area. Supply these for a detailed report; the area's `description` then serves as the section's opening paragraph.",
        ),
    }),
  ).describe("Inspected areas with their findings. Each may carry itemized sub-findings for a detailed report."),
  recommendation: z
    .string()
    .optional()
    .describe("Recommendation narrative, e.g. why a full tear-off is advised over repair."),
  actionPlan: z
    .array(
      z.object({
        title: z.string().describe("Step name, e.g. 'Full Roof Replacement'"),
        description: z.string().describe("What the step involves"),
      }),
    )
    .optional()
    .describe("Ordered recommended action plan, rendered as a numbered list."),
  costBreakdown: z
    .array(
      z.object({
        item: z.string().describe("Line item with its basis, e.g. 'Roof Replacement (25 Squares at $500/Square)'"),
        low: z.number().describe("Low end of the estimate in USD (or the exact figure when there is no range)"),
        high: z.number().optional().describe("High end of the estimate in USD. Omit for a fixed figure."),
        basis: z.string().optional().describe("How the figure was derived, e.g. 'Calculated at $10 to $20 per linear foot.'"),
      }),
    )
    .optional()
    .describe(
      "Itemized cost estimate. Totals are computed from these lines — do not compute them yourself. Supersedes repairCost/replacementCost when present.",
    ),
  disclaimer: z
    .string()
    .optional()
    .describe("Closing caveat about the estimate, e.g. that figures are approximate pending a formal estimate."),
  repairCost: z
    .number()
    .optional()
    .describe("Estimated cost of repairs for current damage in USD. Use costBreakdown instead for an itemized report."),
  replacementCost: z
    .number()
    .optional()
    .describe("Total estimated replacement cost in USD. Use costBreakdown instead for an itemized report."),
  squaresCount: z.number().describe("Squares size of the roof (e.g. 20)"),
});

type RoofReportInput = z.output<typeof roofReportInputSchema>;

export default defineReportTool({
  documentType: "Roof Inspection Report",
  description:
    "Generate a Roof Inspection Report PDF on company letterhead, summarizing inspection findings and estimated costs. " +
    "Supports both a brief summary letter and a fully itemized report (sub-findings per area, recommended action plan, and a ranged cost breakdown).",
  skillName: "generate-roof-report",
  uploadFolder: "Roof Report",
  fileSuffix: "roof-report",
  inputSchema: roofReportInputSchema,
  signerDefaults: REPORT_SIGNER,
  slugSource: (input) => input.recipientName,
  summaryData: (input) => {
    const totals = totalRange(input.costBreakdown);
    return {
      repairCost: input.repairCost,
      replacementCost: input.replacementCost,
      ...(totals ? { estimatedTotalLow: totals.low, estimatedTotalHigh: totals.high } : {}),
    };
  },
  render: renderRoofReport,
});

/** Draws the report body. Exported so the layout can be rendered without a tool context. */
export function renderRoofReport(
  doc: LetterheadDocument,
  input: RoofReportInput,
  signer: SignerInfo,
): void {
  const companyShortName = COMPANY.name.replace(/\s+LLC$/i, "");

  // Metadata block
  doc.labelValue("Date: ", input.date);
  const recipientText = input.recipientCompany
    ? `${input.recipientName}, ${input.recipientCompany}`
    : input.recipientName;
  doc.labelValue("To: ", recipientText);
  doc.labelValue("Property Address: ", input.propertyAddress);
  doc.labelValue("Subject: ", "Roof Inspection Report", { font: doc.fontBold });

  doc.divider();

  doc.line(`Dear ${input.recipientName.split(" ")[0]},`, { lineHeight: 20 });
  doc.paragraph(
    `${companyShortName} has completed a thorough inspection of the roofing system at the above-referenced property. Please find the summary of our findings below, along with attached photographic documentation of the specified areas.`,
  );
  doc.gap(12);

  // Property & Roof Summary — only when there's more than the squares count to say.
  if (input.primaryMaterial || input.primaryDefects) {
    doc.line("Property & Roof Summary", { size: 11, font: doc.fontBold, color: COLOR_NAVY });
    doc.labelValue("Total Roof Area: ", `${input.squaresCount} Squares`);
    if (input.primaryMaterial) doc.labelValue("Primary Material: ", input.primaryMaterial);
    doc.labelValue("Overall Condition: ", titleCase(input.roofCondition));
    if (input.primaryDefects) drawLabeledParagraph(doc, "Primary Defects: ", input.primaryDefects);
    doc.gap(12);
  }

  // Executive Summary
  doc.line("Executive Summary", { size: 11, font: doc.fontBold, color: COLOR_NAVY });
  let execSummaryText = input.executiveSummary ?? defaultExecutiveSummary(input);
  if (input.shingleLayersCount > 1) {
    execSummaryText += ` Notably, the roof currently has ${input.shingleLayersCount} layers of shingles. It is important to highlight that this will accelerate the degradation of the current system and will increase future replacement costs by approximately $20 per square for each additional layer due to the additional labor and disposal required for a multi-layer tear-off.`;
  }
  doc.paragraph(execSummaryText);
  doc.gap(12);

  // Findings. Areas carrying sub-findings render as numbered sections; the
  // flat label-per-area form is kept for short reports.
  const detailed = input.damages.some((d) => d.items && d.items.length > 0);
  doc.line(detailed ? "Detailed Inspection Findings" : "Identified Damage & Required Repairs", {
    size: 11,
    font: doc.fontBold,
    color: COLOR_NAVY,
  });
  if (input.damages.length === 0) {
    doc.line("No significant damage was identified during this inspection.");
  } else if (detailed) {
    input.damages.forEach((damage, index) => {
      doc.ensureSpace(46);
      doc.line(`${index + 1}. ${damage.area}`, { font: doc.fontBold });
      doc.paragraph(damage.description, { indent: 14 });
      for (const item of damage.items ?? []) {
        doc.gap(3);
        drawLabeledParagraph(doc, `${item.label}: `, item.description, 14);
      }
      doc.gap(10);
    });
  } else {
    for (const damage of input.damages) {
      drawLabeledParagraph(doc, `${damage.area}: `, damage.description);
      doc.gap(4);
    }
  }
  doc.gap(12);

  // Recommendations
  if (input.recommendation || input.actionPlan?.length) {
    doc.line("Recommendations", { size: 11, font: doc.fontBold, color: COLOR_NAVY });
    if (input.recommendation) {
      doc.paragraph(input.recommendation);
      if (input.actionPlan?.length) doc.gap(8);
    }
    input.actionPlan?.forEach((step, index) => {
      drawLabeledParagraph(doc, `${index + 1}. ${step.title}: `, step.description);
      doc.gap(4);
    });
    doc.gap(12);
  }

  // Financial Overview — itemized breakdown when supplied, else the two-line summary.
  const totals = totalRange(input.costBreakdown);
  if (input.costBreakdown?.length && totals) {
    doc.line("Estimated Cost Breakdown", { size: 11, font: doc.fontBold, color: COLOR_NAVY });
    for (const entry of input.costBreakdown) {
      doc.ensureSpace(30);
      drawLabeledParagraph(doc, `${entry.item}: `, formatRange(entry.low, entry.high));
      if (entry.basis) doc.paragraph(entry.basis, { size: 9.5, color: COLOR_GRAY, indent: 14, lineHeight: 13 });
      doc.gap(6);
    }
    doc.gap(4);
    doc.labelValue("Total Estimated Project Cost: ", formatRange(totals.low, totals.high), {
      font: doc.fontBold,
    });
    doc.gap(12);
  } else if (input.repairCost !== undefined || input.replacementCost !== undefined) {
    doc.line("Financial Overview", { size: 11, font: doc.fontBold, color: COLOR_NAVY });
    if (input.repairCost !== undefined) {
      doc.line(`Estimated Repair Cost (Current Damage): ${formatUsd(input.repairCost)}`);
    }
    if (input.replacementCost !== undefined) {
      doc.line(`Total Estimated Replacement Cost (${input.squaresCount} Squares): ${formatUsd(input.replacementCost)}`);
    }
    doc.gap(12);
  }

  if (input.disclaimer) {
    doc.paragraph(input.disclaimer, { size: 9.5, color: COLOR_GRAY, lineHeight: 13 });
    doc.gap(12);
  }

  doc.paragraph(
    "If you have any questions about these findings or would like to move forward with scheduling the repairs, please let me know.",
  );
  doc.gap(15);

  // Signature block — kept together on one page.
  doc.ensureSpace(90);
  doc.line("Sincerely,", { lineHeight: 25 });
  doc.line(signer.name, { font: doc.fontBold, lineHeight: 14 });
  if (signer.title && signer.title !== COMPANY.name) {
    doc.line(signer.title, { size: 10, lineHeight: 14 });
  }
  doc.line(signer.email, { size: 10, lineHeight: 14 });
  if (signer.phone) doc.line(signer.phone, { size: 10, lineHeight: 14 });
  doc.line(COMPANY.name, { size: 10, lineHeight: 14 });
}

interface CostLine {
  low: number;
  high?: number | undefined;
}

/** Sums a breakdown into a low/high pair; lines without a `high` are fixed figures. */
function totalRange(breakdown: CostLine[] | undefined): { low: number; high: number } | undefined {
  if (!breakdown?.length) return undefined;
  return {
    low: breakdown.reduce((sum, entry) => sum + entry.low, 0),
    high: breakdown.reduce((sum, entry) => sum + (entry.high ?? entry.low), 0),
  };
}

/** "$800.00 – $1,600.00", collapsing to a single figure when there is no spread. */
function formatRange(low: number, high?: number): string {
  return high === undefined || high === low ? formatUsd(low) : `${formatUsd(low)} – ${formatUsd(high)}`;
}

function titleCase(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Fallback summary for callers that don't write their own. A worn-out roof gets
 * end-of-life phrasing rather than the "expected signs of aging" line, which
 * would contradict the findings on a failing roof.
 */
function defaultExecutiveSummary(input: {
  roofCondition: string;
  estimatedRemainingUsefulLife?: number | undefined;
}): string {
  const life = input.estimatedRemainingUsefulLife;
  const endOfLife = input.roofCondition === "poor" || input.roofCondition === "failing";

  if (endOfLife && !life) {
    return `The roof is currently in ${input.roofCondition} condition and has reached the end of its serviceable life.`;
  }
  if (life === undefined) {
    return `The roof is currently in ${input.roofCondition} condition.`;
  }
  if (endOfLife) {
    return `The roof is currently in ${input.roofCondition} condition, with an estimated ${life} years of remaining useful life.`;
  }
  return `The roof is currently in ${input.roofCondition} condition but shows expected signs of aging, with an estimated ${life} years of remaining useful life.`;
}

/** Bold inline label with word-wrapped text flowing beside and beneath it. */
function drawLabeledParagraph(doc: LetterheadDocument, label: string, text: string, indent = 0): void {
  const labelWidth = doc.fontBold.widthOfTextAtSize(label, 10.5);
  const firstLineWidth = doc.width - doc.margin * 2 - indent - labelWidth;
  const restWidth = doc.width - doc.margin * 2 - indent - 15;

  const lines: string[] = [];
  let current = "";
  for (const word of text.split(" ")) {
    const maxWidth = lines.length === 0 ? firstLineWidth : restWidth;
    const candidate = current ? `${current} ${word}` : word;
    if (doc.font.widthOfTextAtSize(candidate, 10.5) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);

  const [first, ...rest] = lines;
  doc.ensureSpace(15);
  doc.page.drawText(label, { x: doc.margin + indent, y: doc.y, size: 10.5, font: doc.fontBold, color: COLOR_BLACK });
  if (first !== undefined) {
    doc.page.drawText(first, {
      x: doc.margin + indent + labelWidth,
      y: doc.y,
      size: 10.5,
      font: doc.font,
      color: COLOR_BLACK,
    });
  }
  doc.y -= 15;
  for (const line of rest) {
    doc.line(line, { indent: indent + 15 });
  }
}
