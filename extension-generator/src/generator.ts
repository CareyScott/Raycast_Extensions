/**
 * Extension Generator
 * Main logic for generating new Raycast extensions
 */

import * as fs from "fs";
import * as path from "path";
import { analyzeCodebase, generateContextForClaude, getProjectRoot } from "./analyzer";
import { generateWithClaude } from "./claude-cli";
import { GeneratedExtension, GenerationProgress } from "./types";
import { titleToKebab } from "./utils";

const TIMEOUT_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds

export interface GeneratorOptions {
  onProgress?: (progress: GenerationProgress) => void;
  onTimeout?: () => Promise<boolean>; // Returns true to continue, false to cancel
  signal?: AbortSignal;
}

/**
 * Generate a new Raycast extension based on user prompt
 */
export async function generateExtension(
  userPrompt: string,
  options: GeneratorOptions = {}
): Promise<GeneratedExtension> {
  const { onProgress, onTimeout, signal } = options;
  const startTime = Date.now();

  // Helper to check timeout
  const checkTimeout = async () => {
    const elapsed = Date.now() - startTime;
    if (elapsed > TIMEOUT_DURATION && onTimeout) {
      const shouldContinue = await onTimeout();
      if (!shouldContinue) {
        throw new Error("Generation cancelled by user after timeout");
      }
    }
  };

  // Helper to check abort signal
  const checkAbort = () => {
    if (signal?.aborted) {
      throw new Error("Generation cancelled by user");
    }
  };

  try {
    // Stage 1: Analyze codebase
    onProgress?.({
      stage: "analyzing",
      message: "Analyzing existing extensions...",
      percentage: 10,
    });
    checkAbort();

    const codebaseContext = await analyzeCodebase();
    const contextStr = generateContextForClaude(codebaseContext);

    await checkTimeout();

    // Stage 2: Planning
    onProgress?.({
      stage: "planning",
      message: "Planning extension architecture...",
      percentage: 30,
    });
    checkAbort();

    // Create comprehensive prompt for Claude
    const fullPrompt = buildClaudePrompt(userPrompt, contextStr);

    await checkTimeout();

    // Stage 3: Generate with Claude
    onProgress?.({
      stage: "generating",
      message: "Generating extension with Claude Code CLI...",
      percentage: 50,
    });
    checkAbort();

    // Create temporary working directory for Claude
    const projectRoot = getProjectRoot();
    const extensionName = extractExtensionName(userPrompt);
    const extensionDir = path.join(projectRoot, extensionName);

    // Check if directory already exists
    if (fs.existsSync(extensionDir)) {
      throw new Error(
        `Extension directory '${extensionName}' already exists. Please choose a different name or delete the existing directory.`
      );
    }

    // Create the directory
    fs.mkdirSync(extensionDir, { recursive: true });

    await checkTimeout();

    // Execute Claude to generate the extension
    const result = await generateWithClaude(fullPrompt, extensionDir, (msg) => {
      onProgress?.({
        stage: "generating",
        message: msg,
        percentage: 60,
      });
    });

    checkAbort();
    await checkTimeout();

    if (!result.success) {
      throw new Error(result.message);
    }

    // Stage 4: Writing files
    onProgress?.({
      stage: "writing",
      message: "Finalizing extension files...",
      percentage: 80,
    });
    checkAbort();

    // Scan the generated directory to collect all files
    const generatedFiles = await scanGeneratedFiles(extensionDir);

    onProgress?.({
      stage: "completed",
      message: "Extension generated successfully!",
      percentage: 100,
    });

    return {
      name: extensionName,
      directory: extensionDir,
      files: generatedFiles,
      summary: `Generated extension '${extensionName}' with ${generatedFiles.length} files`,
    };
  } catch (error) {
    throw new Error(`Extension generation failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Build comprehensive prompt for Claude Code CLI
 */
function buildClaudePrompt(userPrompt: string, codebaseContext: string): string {
  return `# Task: Generate a New Raycast Extension

## User Requirements:
${userPrompt}

## Codebase Context:
${codebaseContext}

## Instructions:
1. Create a new Raycast extension that fulfills the user's requirements
2. Follow the patterns and structure from existing extensions in this codebase
3. Use TypeScript with strict mode
4. Follow the same file organization: src/, assets/, package.json, tsconfig.json, etc.
5. Use Raycast's @raycast/api for all UI components
6. Include proper error handling and user feedback (toasts, alerts)
7. Add appropriate documentation in README.md
8. Ensure package.json has the correct Raycast extension schema
9. Create an icon.png in the assets/ directory (or provide instructions)
10. Follow the code formatting standards: 120 char width, 2 spaces, double quotes

Please generate all necessary files for this extension in the current directory.`;
}

/**
 * Extract extension name from user prompt
 * Tries to find a name in the prompt, otherwise generates one
 */
function extractExtensionName(prompt: string): string {
  // Look for patterns like "called X", "named X", "extension X"
  const patterns = [
    /(?:called|named)\s+["']([^"']+)["']/i,
    /(?:called|named)\s+(\S+)/i,
    /extension\s+["']([^"']+)["']/i,
    /extension\s+(\S+)/i,
  ];

  for (const pattern of patterns) {
    const match = prompt.match(pattern);
    if (match && match[1]) {
      return titleToKebab(match[1]);
    }
  }

  // Generate a default name based on keywords in the prompt
  const words = prompt
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 3 && !["create", "build", "make", "extension", "raycast"].includes(w))
    .slice(0, 3);

  if (words.length > 0) {
    return titleToKebab(words.join(" "));
  }

  // Fallback to generic name with timestamp
  return `custom-extension-${Date.now()}`;
}

/**
 * Recursively scan directory and collect all generated files
 */
async function scanGeneratedFiles(dirPath: string, relativePath = ""): Promise<Array<{ path: string; content: string }>> {
  const files: Array<{ path: string; content: string }> = [];

  try {
    const items = fs.readdirSync(dirPath);

    for (const item of items) {
      // Skip node_modules and hidden files
      if (item === "node_modules" || item.startsWith(".")) {
        continue;
      }

      const fullPath = path.join(dirPath, item);
      const relPath = relativePath ? path.join(relativePath, item) : item;
      const stats = fs.statSync(fullPath);

      if (stats.isDirectory()) {
        const subFiles = await scanGeneratedFiles(fullPath, relPath);
        files.push(...subFiles);
      } else if (stats.isFile()) {
        // Read file content (skip binary files)
        try {
          const content = fs.readFileSync(fullPath, "utf-8");
          files.push({ path: relPath, content });
        } catch {
          // Skip binary files
          files.push({ path: relPath, content: "[Binary file]" });
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}:`, error);
  }

  return files;
}
