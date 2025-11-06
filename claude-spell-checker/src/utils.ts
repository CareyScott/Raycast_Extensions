import { SpellCheckResult, DiffLine, TextChange } from "./types";

/**
 * Parse the Claude response and generate a spell check result
 */
export function parseClaudeResponse(
  originalText: string,
  correctedText: string,
  language: string
): SpellCheckResult {
  const hasChanges = originalText !== correctedText;
  const changes = hasChanges ? generateChanges(originalText, correctedText) : [];

  return {
    originalText,
    correctedText,
    detectedLanguage: language,
    changes,
    hasChanges,
  };
}

/**
 * Generate a list of changes between original and corrected text
 */
function generateChanges(original: string, corrected: string): TextChange[] {
  const changes: TextChange[] = [];

  // Simple word-by-word comparison
  const originalWords = original.split(/(\s+)/);
  const correctedWords = corrected.split(/(\s+)/);

  let position = 0;
  const maxLength = Math.max(originalWords.length, correctedWords.length);

  for (let i = 0; i < maxLength; i++) {
    const origWord = originalWords[i] || "";
    const corrWord = correctedWords[i] || "";

    if (origWord !== corrWord) {
      if (!origWord && corrWord) {
        changes.push({
          type: "addition",
          correctedText: corrWord,
          position,
        });
      } else if (origWord && !corrWord) {
        changes.push({
          type: "deletion",
          originalText: origWord,
          position,
        });
      } else {
        changes.push({
          type: "replacement",
          originalText: origWord,
          correctedText: corrWord,
          position,
        });
      }
    }

    position += origWord.length;
  }

  return changes;
}

/**
 * Generate diff lines for display
 */
export function generateDiffLines(original: string, corrected: string): DiffLine[] {
  const diffLines: DiffLine[] = [];

  // Split by lines for line-by-line comparison
  const originalLines = original.split("\n");
  const correctedLines = corrected.split("\n");

  // Simple line-by-line diff
  const maxLines = Math.max(originalLines.length, correctedLines.length);

  for (let i = 0; i < maxLines; i++) {
    const origLine = originalLines[i];
    const corrLine = correctedLines[i];

    if (origLine === corrLine) {
      diffLines.push({
        type: "unchanged",
        content: origLine || "",
        lineNumber: i + 1,
      });
    } else {
      if (origLine !== undefined) {
        diffLines.push({
          type: "removed",
          content: origLine,
          lineNumber: i + 1,
        });
      }
      if (corrLine !== undefined) {
        diffLines.push({
          type: "added",
          content: corrLine,
          lineNumber: i + 1,
        });
      }
    }
  }

  return diffLines;
}

/**
 * Generate a side-by-side diff view
 */
export function generateSideBySideDiff(original: string, corrected: string): string {
  const originalLines = original.split("\n");
  const correctedLines = corrected.split("\n");
  const maxLines = Math.max(originalLines.length, correctedLines.length);

  let diff = "";

  for (let i = 0; i < maxLines; i++) {
    const origLine = originalLines[i] || "";
    const corrLine = correctedLines[i] || "";

    if (origLine === corrLine) {
      diff += `  ${origLine}\n`;
    } else {
      if (origLine) {
        diff += `- ${origLine}\n`;
      }
      if (corrLine) {
        diff += `+ ${corrLine}\n`;
      }
    }
  }

  return diff;
}

/**
 * Calculate similarity percentage between two texts
 */
export function calculateSimilarity(text1: string, text2: string): number {
  if (text1 === text2) return 100;
  if (!text1 || !text2) return 0;

  const longer = text1.length > text2.length ? text1 : text2;
  const shorter = text1.length > text2.length ? text2 : text1;

  const editDistance = levenshteinDistance(text1, text2);
  return Math.round(((longer.length - editDistance) / longer.length) * 100);
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Format a language code to a readable name
 */
export function formatLanguageName(code: string): string {
  const languageNames: Record<string, string> = {
    auto: "Auto-detected",
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

  return languageNames[code] || code.toUpperCase();
}

/**
 * Truncate text for preview
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}
