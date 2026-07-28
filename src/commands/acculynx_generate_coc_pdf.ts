import { z } from "zod";
import { COMPANY, COC_SIGNER } from "../lib/company.ts";
import { defineReportTool } from "../lib/define-report-tool.ts";
import { formatLongDate, formatUsd } from "../lib/pdf.ts";

/** Natural-language list of supplement descriptions for the certification text. */
function buildSupplementSentence(descriptions: string[]): string {
  if (descriptions.length === 0) return "";
  if (descriptions.length === 1) {
    return ` I have attached a supplement request for ${descriptions[0]}.`;
  }
  if (descriptions.length === 2) {
    return ` I have attached supplement requests for ${descriptions[0]} and ${descriptions[1]}.`;
  }
  const last = descriptions.at(-1);
  return ` I have attached supplement requests for ${descriptions.slice(0, -1).join(", ")}, and ${last}.`;
}

const totalSupplements = (supplements: { amount: number }[]) =>
  supplements.reduce((sum, item) => sum + item.amount, 0);

export default defineReportTool({
  documentType: "Certificate of Completion",
  description:
    "Generate a Certificate of Completion (COC) PDF on company letterhead, certifying job completion and requesting funds release.",
  skillName: "draft-coc",
  uploadFolder: "Certificate of Completion",
  fileSuffix: "coc",
  inputSchema: z.object({
    jobId: z.string().guid().describe("Target Job UUID where file will belong"),
    customerName: z.string().describe("Name of the customer / property owner"),
    address: z.string().describe("Address of the property where work was completed"),
    claimNumber: z.string().describe("Insurance claim number"),
    licenseNumber: z.string().default(COMPANY.licenseNumber).describe("Home Builders license number"),
    scopeOriginalAmount: z.number().describe("Total original insurance scope RCV amount"),
    supplements: z.array(
      z.object({
        description: z.string().describe("Description of the supplemental claim item"),
        amount: z.number().describe("Supplemental amount in USD"),
      }),
    ).describe("List of supplemental items"),
    completionDate: z.string().describe("Date the project was completed"),
  }),
  signerDefaults: COC_SIGNER,
  slugSource: (input) => input.customerName,
  summaryData: (input) => ({
    totalSupplements: totalSupplements(input.supplements),
    newRcvTotal: input.scopeOriginalAmount + totalSupplements(input.supplements),
  }),
  render(doc, input, signer) {
    const companyShortName = COMPANY.name.replace(/\s+LLC$/i, "");

    // Certification paragraph
    const supplementSentence = buildSupplementSentence(
      input.supplements.map((s) => s.description.trim()),
    );
    doc.paragraph(
      `${companyShortName} certifies that all work at the ${input.customerName} residence at address ${input.address} has been completed.${supplementSentence} I also attached photos of the completed work. Please release the funds.`,
    );
    doc.gap(10);

    doc.heading(input.licenseNumber, { lineHeight: 25 });
    doc.heading(`Claim # ${input.claimNumber}`, { lineHeight: 25 });

    doc.heading("Scope");
    doc.line(`Total Original RCV Amount ${formatUsd(input.scopeOriginalAmount)}`, { lineHeight: 22 });

    doc.heading("Supplemental Claims");
    if (input.supplements.length > 0) {
      for (const item of input.supplements) {
        doc.line(`${item.description} ${formatUsd(item.amount)}`, { lineHeight: 18 });
      }
    } else {
      doc.line("None", { lineHeight: 18 });
    }
    doc.gap(4);

    doc.heading("Total");
    doc.line(`Supplements ${formatUsd(totalSupplements(input.supplements))}`, { lineHeight: 16 });
    doc.line(
      `Total Claim Amount (New RCV Total) ${formatUsd(input.scopeOriginalAmount + totalSupplements(input.supplements))}`,
      { lineHeight: 22 },
    );

    doc.heading("Project Completion Date");
    doc.line(formatLongDate(input.completionDate), { lineHeight: 28 });

    // Signature block — kept together on one page.
    doc.ensureSpace(110);
    doc.line("Thanks,", { lineHeight: 25 });
    doc.line(signer.name, { font: doc.fontBold, lineHeight: 14 });
    if (signer.title) doc.line(signer.title, { lineHeight: 14 });
    doc.line(companyShortName, { lineHeight: 14 });
    doc.heading(signer.email, { font: doc.font, lineHeight: 14 });
    if (signer.phone) doc.line(signer.phone, { lineHeight: 14 });
    if (signer.secondPhone) doc.line(signer.secondPhone, { lineHeight: 14 });
  },
});
