/**
 * Codebase Analyzer
 * Analyzes existing Raycast extensions to extract patterns and context
 */

import * as fs from "fs";
import * as path from "path";
import { CodebaseContext, ExtensionInfo } from "./types";

/**
 * Get the project root directory (parent of current extension)
 */
export function getProjectRoot(): string {
  return "/Users/scottcarey/Developer/Raycast Extensions";
}

/**
 * Check if a directory is a Raycast extension
 */
function isExtensionDirectory(dirPath: string): boolean {
  const packageJsonPath = path.join(dirPath, "package.json");
  if (!fs.existsSync(packageJsonPath)) {
    return false;
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
    // Check for Raycast extension schema
    return packageJson.$schema && packageJson.$schema.includes("raycast.com/schemas/extension.json");
  } catch {
    return false;
  }
}

/**
 * Get directory tree structure as a string
 */
function getDirectoryTree(dirPath: string, prefix = "", maxDepth = 3, currentDepth = 0): string {
  if (currentDepth >= maxDepth) {
    return "";
  }

  let tree = "";
  try {
    const items = fs.readdirSync(dirPath);
    const filteredItems = items.filter((item) => !item.startsWith(".") && item !== "node_modules" && item !== "dist");

    filteredItems.forEach((item, index) => {
      const isLast = index === filteredItems.length - 1;
      const itemPath = path.join(dirPath, item);
      const stats = fs.statSync(itemPath);

      tree += `${prefix}${isLast ? "└── " : "├── "}${item}\n`;

      if (stats.isDirectory()) {
        const newPrefix = prefix + (isLast ? "    " : "│   ");
        tree += getDirectoryTree(itemPath, newPrefix, maxDepth, currentDepth + 1);
      }
    });
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error);
  }

  return tree;
}

/**
 * Analyze a single extension directory
 */
function analyzeExtension(extensionDir: string): ExtensionInfo | null {
  const packageJsonPath = path.join(extensionDir, "package.json");

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
    const commands = packageJson.commands || [];

    // Extract key patterns from source files
    const keyPatterns: string[] = [];
    const srcDir = path.join(extensionDir, "src");

    if (fs.existsSync(srcDir)) {
      const srcFiles = fs.readdirSync(srcDir).filter((f) => f.endsWith(".ts") || f.endsWith(".tsx"));

      // Check for common patterns
      srcFiles.forEach((file) => {
        const filePath = path.join(srcDir, file);
        const content = fs.readFileSync(filePath, "utf-8");

        if (content.includes("useNavigation")) keyPatterns.push("useNavigation hook");
        if (content.includes("useState")) keyPatterns.push("useState hook");
        if (content.includes("ActionPanel")) keyPatterns.push("ActionPanel");
        if (content.includes("Form")) keyPatterns.push("Form component");
        if (content.includes("List")) keyPatterns.push("List component");
        if (content.includes("Detail")) keyPatterns.push("Detail component");
        if (content.includes("showToast")) keyPatterns.push("Toast notifications");
        if (content.includes("confirmAlert")) keyPatterns.push("Confirm dialogs");
        if (content.includes("Clipboard")) keyPatterns.push("Clipboard access");
      });
    }

    const fileStructure = getDirectoryTree(extensionDir);

    return {
      name: packageJson.name || path.basename(extensionDir),
      directory: extensionDir,
      description: packageJson.description || "",
      commands: commands.map((cmd: { name: string; title?: string }) => cmd.title || cmd.name),
      fileStructure,
      keyPatterns: [...new Set(keyPatterns)], // Remove duplicates
    };
  } catch (error) {
    console.error(`Error analyzing extension ${extensionDir}:`, error);
    return null;
  }
}

/**
 * Analyze the entire codebase and extract context
 */
export async function analyzeCodebase(): Promise<CodebaseContext> {
  const projectRoot = getProjectRoot();
  const existingExtensions: ExtensionInfo[] = [];

  try {
    const items = fs.readdirSync(projectRoot);

    for (const item of items) {
      const itemPath = path.join(projectRoot, item);
      const stats = fs.statSync(itemPath);

      // Skip non-directories and hidden directories
      if (!stats.isDirectory() || item.startsWith(".")) {
        continue;
      }

      // Check if this is an extension directory
      if (isExtensionDirectory(itemPath)) {
        const extensionInfo = analyzeExtension(itemPath);
        if (extensionInfo) {
          existingExtensions.push(extensionInfo);
        }
      }
    }
  } catch (error) {
    console.error("Error analyzing codebase:", error);
  }

  // Generate common patterns summary
  const commonPatterns = generateCommonPatterns(existingExtensions);

  return {
    existingExtensions,
    commonPatterns,
    projectRoot,
  };
}

/**
 * Generate a summary of common patterns across extensions
 */
function generateCommonPatterns(extensions: ExtensionInfo[]): string {
  if (extensions.length === 0) {
    return "No existing extensions found.";
  }

  const allPatterns = extensions.flatMap((ext) => ext.keyPatterns);
  const patternCounts = new Map<string, number>();

  allPatterns.forEach((pattern) => {
    patternCounts.set(pattern, (patternCounts.get(pattern) || 0) + 1);
  });

  let summary = "## Common Patterns Across Extensions:\n\n";

  patternCounts.forEach((count, pattern) => {
    summary += `- ${pattern} (used in ${count}/${extensions.length} extensions)\n`;
  });

  summary += `\n## Standard Structure:\n`;
  summary += `- src/ directory with TypeScript files\n`;
  summary += `- types.ts for interfaces\n`;
  summary += `- utils.ts for utility functions\n`;
  summary += `- package.json with Raycast schema\n`;
  summary += `- tsconfig.json for TypeScript configuration\n`;
  summary += `- assets/ directory for icons\n`;

  return summary;
}

/**
 * Generate detailed context string for Claude API
 */
export function generateContextForClaude(context: CodebaseContext): string {
  let contextStr = "# Raycast Extensions Codebase Context\n\n";
  contextStr += `Project Root: ${context.projectRoot}\n\n`;
  contextStr += `## Existing Extensions (${context.existingExtensions.length}):\n\n`;

  context.existingExtensions.forEach((ext) => {
    contextStr += `### ${ext.name}\n`;
    contextStr += `Description: ${ext.description}\n`;
    contextStr += `Commands: ${ext.commands.join(", ")}\n`;
    contextStr += `Key Patterns: ${ext.keyPatterns.join(", ")}\n`;
    contextStr += `\nFile Structure:\n\`\`\`\n${ext.fileStructure}\`\`\`\n\n`;
  });

  contextStr += `\n${context.commonPatterns}\n`;

  return contextStr;
}
