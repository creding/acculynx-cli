import { PDFDocument, PDFFont, PDFImage, PDFPage, StandardFonts, rgb } from "pdf-lib";
import { COMPANY } from "./company.ts";

// Color Palette inspired by Patriot Roofing and Builders logo:
// Navy: #101F37 (R: 16, G: 31, B: 55)
// Red: #AF2635 (R: 175, G: 38, B: 53)
// Gray: #7A7C7F (R: 122, G: 124, B: 127)
export const COLOR_NAVY = rgb(16 / 255, 31 / 255, 55 / 255);
export const COLOR_RED = rgb(175 / 255, 38 / 255, 53 / 255);
export const COLOR_GRAY = rgb(122 / 255, 124 / 255, 127 / 255);
export const COLOR_LIGHT_BG = rgb(245 / 255, 246 / 255, 248 / 255);
export const COLOR_BLACK = rgb(0, 0, 0);

const PAGE_SIZE: [number, number] = [612, 792]; // US Letter
const MARGIN = 54;
const BOTTOM_MARGIN = 64;

/**
 * Word-wraps text to a max width. A single word wider than the line is
 * hard-broken by characters so it can never overflow the page.
 */
export function wrapText(text: string, maxWidth: number, font: PDFFont, fontSize: number): string[] {
  const lines: string[] = [];
  let currentLine = "";

  const breakLongWord = (word: string): string[] => {
    const pieces: string[] = [];
    let piece = "";
    for (const char of word) {
      if (font.widthOfTextAtSize(piece + char, fontSize) > maxWidth && piece) {
        pieces.push(piece);
        piece = char;
      } else {
        piece += char;
      }
    }
    if (piece) pieces.push(piece);
    return pieces;
  };

  for (const word of text.split(" ")) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, fontSize) <= maxWidth) {
      currentLine = candidate;
      continue;
    }
    if (currentLine) lines.push(currentLine);
    if (font.widthOfTextAtSize(word, fontSize) > maxWidth) {
      const pieces = breakLongWord(word);
      lines.push(...pieces.slice(0, -1));
      currentLine = pieces.at(-1) ?? "";
    } else {
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

export interface LetterheadOptions {
  logoBytes?: Uint8Array;
}

interface TextStyle {
  size?: number;
  font?: PDFFont;
  color?: ReturnType<typeof rgb>;
  lineHeight?: number;
  indent?: number;
}

/**
 * A letterhead document with an auto-paginating cursor. The first page gets
 * the full company letterhead; content that runs past the bottom margin
 * flows onto continuation pages with a slim header. Call finalize() to stamp
 * page numbers and get the PDF bytes.
 */
export class LetterheadDocument {
  readonly pdfDoc: PDFDocument;
  readonly font: PDFFont;
  readonly fontBold: PDFFont;
  readonly width: number;
  readonly margin = MARGIN;

  page: PDFPage;
  y: number;

  private logo?: PDFImage;

  private constructor(pdfDoc: PDFDocument, font: PDFFont, fontBold: PDFFont, logo?: PDFImage) {
    this.pdfDoc = pdfDoc;
    this.font = font;
    this.fontBold = fontBold;
    this.logo = logo;
    this.page = pdfDoc.addPage(PAGE_SIZE);
    this.width = this.page.getSize().width;
    this.y = this.drawLetterhead();
  }

  static async create(options: LetterheadOptions = {}): Promise<LetterheadDocument> {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    let logo: PDFImage | undefined;
    if (options.logoBytes) {
      try {
        logo = await pdfDoc.embedPng(options.logoBytes);
      } catch (err) {
        console.warn("[LetterheadDocument] Failed to embed PNG logo:", err);
      }
    }
    return new LetterheadDocument(pdfDoc, font, fontBold, logo);
  }

  /** Full letterhead on the first page. Returns the content start Y. */
  private drawLetterhead(): number {
    const { height } = this.page.getSize();
    let y = height - 60;
    this.page.drawText(COMPANY.name, { x: MARGIN, y, size: 10.5, font: this.fontBold, color: COLOR_BLACK });
    y -= 14;
    this.page.drawText(COMPANY.addressLine1, { x: MARGIN, y, size: 10, font: this.font, color: COLOR_BLACK });
    y -= 14;
    this.page.drawText(COMPANY.addressLine2, { x: MARGIN, y, size: 10, font: this.font, color: COLOR_BLACK });
    y -= 14;
    this.page.drawText(COMPANY.phone, { x: MARGIN, y, size: 10, font: this.font, color: COLOR_BLACK });

    if (this.logo) {
      const logoWidth = 100;
      const logoHeight = this.logo.height * (logoWidth / this.logo.width);
      this.page.drawImage(this.logo, {
        x: this.width - MARGIN - logoWidth,
        y: height - 60 - logoHeight + 12,
        width: logoWidth,
        height: logoHeight,
      });
    } else {
      this.page.drawText("PATRIOT", {
        x: this.width - MARGIN - 100,
        y: height - 60,
        size: 15,
        font: this.fontBold,
        color: COLOR_NAVY,
      });
      this.page.drawText("ROOFING & BUILDERS", {
        x: this.width - MARGIN - 100,
        y: height - 70,
        size: 6,
        font: this.fontBold,
        color: COLOR_RED,
      });
    }

    return height - 165;
  }

  /** Slim continuation header on overflow pages. Returns the content start Y. */
  private drawContinuationHeader(): number {
    const { height } = this.page.getSize();
    this.page.drawText(COMPANY.name, {
      x: MARGIN,
      y: height - 44,
      size: 9,
      font: this.fontBold,
      color: COLOR_GRAY,
    });
    this.page.drawLine({
      start: { x: MARGIN, y: height - 52 },
      end: { x: this.width - MARGIN, y: height - 52 },
      thickness: 0.5,
      color: COLOR_GRAY,
    });
    return height - 76;
  }

  /** Breaks to a new page when fewer than `needed` points remain. */
  ensureSpace(needed: number): void {
    if (this.y - needed >= BOTTOM_MARGIN) return;
    this.page = this.pdfDoc.addPage(PAGE_SIZE);
    this.y = this.drawContinuationHeader();
  }

  /** One line, no wrapping. Advances the cursor. */
  line(text: string, style: TextStyle = {}): void {
    const lineHeight = style.lineHeight ?? 15;
    this.ensureSpace(lineHeight);
    this.page.drawText(text, {
      x: MARGIN + (style.indent ?? 0),
      y: this.y,
      size: style.size ?? 10.5,
      font: style.font ?? this.font,
      color: style.color ?? COLOR_BLACK,
    });
    this.y -= lineHeight;
  }

  /** Word-wrapped paragraph. Advances the cursor per line. */
  paragraph(text: string, style: TextStyle = {}): void {
    const size = style.size ?? 10.5;
    const font = style.font ?? this.font;
    const indent = style.indent ?? 0;
    const maxWidth = this.width - MARGIN * 2 - indent;
    for (const line of wrapText(text, maxWidth, font, size)) {
      this.line(line, style);
    }
  }

  /** Bold underlined section heading (keeps the next line on the same page). */
  heading(text: string, style: TextStyle = {}): void {
    const size = style.size ?? 10.5;
    const lineHeight = style.lineHeight ?? 18;
    // Never strand a heading at the bottom of a page.
    this.ensureSpace(lineHeight + 15);
    const font = style.font ?? this.fontBold;
    const x = MARGIN + (style.indent ?? 0);
    this.page.drawText(text, { x, y: this.y, size, font, color: style.color ?? COLOR_BLACK });
    this.page.drawLine({
      start: { x, y: this.y - 2 },
      end: { x: x + font.widthOfTextAtSize(text, size), y: this.y - 2 },
      thickness: 0.8,
      color: style.color ?? COLOR_BLACK,
    });
    this.y -= lineHeight;
  }

  /** Bold label followed by regular text on the same line. */
  labelValue(label: string, value: string, style: TextStyle = {}): void {
    const size = style.size ?? 10.5;
    const lineHeight = style.lineHeight ?? 14;
    this.ensureSpace(lineHeight);
    const x = MARGIN + (style.indent ?? 0);
    this.page.drawText(label, { x, y: this.y, size, font: this.fontBold, color: COLOR_BLACK });
    this.page.drawText(value, {
      x: x + this.fontBold.widthOfTextAtSize(label, size),
      y: this.y,
      size,
      font: style.font ?? this.font,
      color: style.color ?? COLOR_BLACK,
    });
    this.y -= lineHeight;
  }

  /** Full-width horizontal divider. */
  divider(): void {
    this.ensureSpace(20);
    this.y -= 4;
    this.page.drawLine({
      start: { x: MARGIN, y: this.y },
      end: { x: this.width - MARGIN, y: this.y },
      thickness: 0.8,
      color: COLOR_GRAY,
    });
    this.y -= 16;
  }

  /** Vertical whitespace. */
  gap(points: number): void {
    this.y -= points;
  }

  /** Stamps page numbers (multi-page only) and returns the PDF bytes. */
  async finalize(): Promise<Uint8Array> {
    const pages = this.pdfDoc.getPages();
    if (pages.length > 1) {
      pages.forEach((page, index) => {
        const label = `Page ${index + 1} of ${pages.length}`;
        const labelWidth = this.font.widthOfTextAtSize(label, 8);
        page.drawText(label, {
          x: (page.getSize().width - labelWidth) / 2,
          y: 32,
          size: 8,
          font: this.font,
          color: COLOR_GRAY,
        });
      });
    }
    return this.pdfDoc.save();
  }
}

/** Formats a USD amount with grouping and two decimals, e.g. $12,340.50. */
export function formatUsd(amount: number): string {
  return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/**
 * Formats a date string as "June 15, 2026". Parses YYYY-MM-DD directly (the
 * common AccuLynx/user format), falls back to Date parsing pinned to noon to
 * dodge timezone shifts, and returns the input unchanged when unparseable.
 */
export function formatLongDate(dateStr: string): string {
  if (!dateStr) return "";

  const match = dateStr.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    const monthVal = parseInt(match[2], 10);
    const day = parseInt(match[3], 10);
    if (monthVal >= 1 && monthVal <= 12) {
      return `${MONTH_NAMES[monthVal - 1]} ${day}, ${match[1]}`;
    }
  }

  const normalized = dateStr.trim().replace(/\//g, "-");
  const d = new Date(normalized + "T12:00:00");
  if (!isNaN(d.getTime())) {
    return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  }

  return dateStr;
}
