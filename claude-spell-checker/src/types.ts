export interface SpellCheckResult {
  originalText: string;
  correctedText: string;
  detectedLanguage: string;
  changes: TextChange[];
  hasChanges: boolean;
}

export interface TextChange {
  type: "addition" | "deletion" | "replacement";
  originalText?: string;
  correctedText?: string;
  position: number;
  explanation?: string;
}

export interface DiffLine {
  type: "unchanged" | "added" | "removed";
  content: string;
  lineNumber?: number;
}

export interface ClaudeMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ClaudeRequest {
  model: string;
  max_tokens: number;
  messages: ClaudeMessage[];
}

export interface ClaudeResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{
    type: string;
    text: string;
  }>;
  model: string;
  stop_reason: string;
}

export const LANGUAGE_NAMES: Record<string, string> = {
  auto: "Auto-detect",
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
  it: "Italian",
  pt: "Portuguese",
  nl: "Dutch",
  pl: "Polish",
  ru: "Russian",
  zh: "Chinese",
  ja: "Japanese",
  ko: "Korean",
};
