/**
 * Extension Generator Types
 */

export type GenerationStatus = "pending" | "generating" | "completed" | "failed" | "cancelled";

export interface GenerationPrompt {
  id: string;
  timestamp: string;
  prompt: string;
  status: GenerationStatus;
  result?: GeneratedExtension;
  error?: string;
  duration?: number; // in milliseconds
  continueCount?: number; // number of times user chose to continue after 10 min
}

export interface GeneratedExtension {
  name: string;
  directory: string;
  files: GeneratedFile[];
  summary: string;
}

export interface GeneratedFile {
  path: string; // relative path within extension directory
  content: string;
}

export interface PromptHistory {
  prompts: GenerationPrompt[];
}

export interface CodebaseContext {
  existingExtensions: ExtensionInfo[];
  commonPatterns: string;
  projectRoot: string;
}

export interface ExtensionInfo {
  name: string;
  directory: string;
  description: string;
  commands: string[];
  fileStructure: string;
  keyPatterns: string[];
}

export interface GenerationProgress {
  stage: "analyzing" | "planning" | "generating" | "writing" | "completed";
  message: string;
  percentage: number;
}
