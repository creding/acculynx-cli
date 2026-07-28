/**
 * Core constants and global limits for the AccuLynx tools.
 */

// Maximum response buffer size in characters before triggering list/content truncation
export const CHARACTER_LIMIT = 25000;

// Dual-mode serialization format choices
export const ResponseFormat = {
  MARKDOWN: "markdown",
  JSON: "json",
} as const;

export type ResponseFormat = (typeof ResponseFormat)[keyof typeof ResponseFormat];
