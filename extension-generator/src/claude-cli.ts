/**
 * Claude CLI Integration
 * Interfaces with Claude Code CLI to generate extension code
 */

import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs";

const execAsync = promisify(exec);

/**
 * Find Claude CLI executable path
 */
export async function findClaudePath(): Promise<string> {
  // Check common installation paths
  const commonPaths = ["/opt/homebrew/bin/claude", "/usr/local/bin/claude", "/usr/bin/claude"];

  for (const path of commonPaths) {
    if (fs.existsSync(path)) {
      return path;
    }
  }

  // Try to find using 'which' command
  try {
    const { stdout } = await execAsync("which claude");
    const path = stdout.trim();
    if (path && fs.existsSync(path)) {
      return path;
    }
  } catch {
    // which command failed, continue
  }

  throw new Error(
    "Claude CLI not found. Please install Claude Code from https://claude.com/code or specify the path in preferences."
  );
}

/**
 * Execute Claude CLI with a prompt
 */
export async function executeClaude(
  prompt: string,
  workingDir: string,
  onProgress?: (message: string) => void
): Promise<string> {
  const claudePath = await findClaudePath();

  // Extended PATH to include common binary locations
  const extendedPath = `${process.env.PATH}:/opt/homebrew/bin:/usr/local/bin:/usr/bin`;

  onProgress?.("Preparing Claude CLI execution...");

  try {
    // Execute Claude CLI with the prompt
    // Using --yes flag to auto-confirm, and --format json for structured output
    const command = `cd "${workingDir}" && "${claudePath}" --yes "${prompt.replace(/"/g, '\\"')}"`;

    onProgress?.("Executing Claude CLI...");

    const { stdout, stderr } = await execAsync(command, {
      env: { ...process.env, PATH: extendedPath },
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer for large outputs
    });

    if (stderr) {
      console.warn("Claude CLI stderr:", stderr);
    }

    onProgress?.("Claude CLI execution completed");

    return stdout;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Claude CLI execution failed: ${errorMessage}`);
  }
}

/**
 * Parse Claude CLI output to extract generated files
 * This assumes Claude CLI creates files directly in the working directory
 */
export interface ClaudeGenerationResult {
  success: boolean;
  message: string;
  filesCreated: string[];
}

/**
 * Execute Claude and monitor the working directory for new files
 */
export async function generateWithClaude(
  prompt: string,
  workingDir: string,
  onProgress?: (message: string) => void
): Promise<ClaudeGenerationResult> {
  try {
    // Get list of files before execution
    const filesBefore = fs.existsSync(workingDir) ? fs.readdirSync(workingDir) : [];

    // Execute Claude
    const output = await executeClaude(prompt, workingDir, onProgress);

    // Get list of files after execution
    const filesAfter = fs.existsSync(workingDir) ? fs.readdirSync(workingDir) : [];

    // Determine which files were created
    const filesCreated = filesAfter.filter((f) => !filesBefore.includes(f));

    return {
      success: true,
      message: output,
      filesCreated,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : String(error),
      filesCreated: [],
    };
  }
}
