/**
 * Translation result from English to German
 */
export interface TranslationResult {
  original: string;
  translated: string;
  alternatives?: string[];
  context?: string;
  category?: TranslationCategory;
}

/**
 * Categories for FinTech translations
 */
export type TranslationCategory =
  | "payment"
  | "account"
  | "transaction"
  | "security"
  | "verification"
  | "general"
  | "ui"
  | "error"
  | "success";

/**
 * FinTech-specific term mapping
 */
export interface FinTechTerm {
  english: string;
  german: string;
  alternatives?: string[];
  context?: string;
  category: TranslationCategory;
}

/**
 * Translation options
 */
export interface TranslationOptions {
  formal?: boolean; // Use formal "Sie" instead of informal "du"
  context?: string; // Additional context for translation
}
