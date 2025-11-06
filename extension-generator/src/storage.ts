/**
 * Prompt History Storage
 * Handles loading and saving generation prompts to disk
 */

import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { PromptHistory, GenerationPrompt } from "./types";

const STORAGE_DIR = path.join(os.homedir(), ".raycast-extension-generator");
const STORAGE_FILE = path.join(STORAGE_DIR, "prompt-history.json");

/**
 * Ensure storage directory exists
 */
function ensureStorageDir(): void {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
}

/**
 * Load prompt history from disk
 */
export function loadHistory(): PromptHistory {
  ensureStorageDir();

  if (!fs.existsSync(STORAGE_FILE)) {
    return { prompts: [] };
  }

  try {
    const data = fs.readFileSync(STORAGE_FILE, "utf-8");
    return JSON.parse(data) as PromptHistory;
  } catch (error) {
    console.error("Error loading prompt history:", error);
    return { prompts: [] };
  }
}

/**
 * Save prompt history to disk
 */
export function saveHistory(history: PromptHistory): void {
  ensureStorageDir();

  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(history, null, 2), "utf-8");
  } catch (error) {
    console.error("Error saving prompt history:", error);
    throw new Error(`Failed to save prompt history: ${error}`);
  }
}

/**
 * Add a new prompt to history
 */
export function addPrompt(prompt: GenerationPrompt): void {
  const history = loadHistory();
  history.prompts.unshift(prompt); // Add to beginning for most recent first
  saveHistory(history);
}

/**
 * Update an existing prompt in history
 */
export function updatePrompt(promptId: string, updates: Partial<GenerationPrompt>): void {
  const history = loadHistory();
  const index = history.prompts.findIndex((p) => p.id === promptId);

  if (index !== -1) {
    history.prompts[index] = { ...history.prompts[index], ...updates };
    saveHistory(history);
  }
}

/**
 * Delete a prompt from history
 */
export function deletePrompt(promptId: string): void {
  const history = loadHistory();
  history.prompts = history.prompts.filter((p) => p.id !== promptId);
  saveHistory(history);
}

/**
 * Get a specific prompt by ID
 */
export function getPrompt(promptId: string): GenerationPrompt | undefined {
  const history = loadHistory();
  return history.prompts.find((p) => p.id === promptId);
}

/**
 * Clear all prompt history
 */
export function clearHistory(): void {
  saveHistory({ prompts: [] });
}
