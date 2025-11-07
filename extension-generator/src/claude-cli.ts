/**
 * Claude CLI Integration
 * Interfaces with Claude Code CLI to generate extension code
 */

import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs";

const execAsync = promisify(exec);

/**
 * Resolve the full path to Claude CLI
 */
async function resolveClaudePath(claudePath: string = "claude"): Promise<string> {
  // If it's already an absolute path, use it
  if (claudePath.startsWith("/")) {
    return claudePath;
  }

  // Try to find claude in common locations
  const commonPaths = ["/opt/homebrew/bin/claude", "/usr/local/bin/claude", "/usr/bin/claude"];

  // Extended environment with common bin directories
  const env = {
    ...process.env,
    PATH: `${process.env.PATH}:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin`,
  };

  // Check common paths first
  for (const path of commonPaths) {
    try {
      await execAsync(`test -x "${path}"`, { timeout: 1000, env });
      return path;
    } catch {
      // Continue to next path
    }
  }

  // Try using 'which' to find it
  try {
    const { stdout } = await execAsync(`which ${claudePath}`, { timeout: 2000, env });
    const path = stdout.trim();
    if (path) {
      return path;
    }
  } catch {
    // Fall back to original path
  }

  return claudePath;
}

/**
 * Find Claude CLI executable path
 */
export async function findClaudePath(): Promise<string> {
  const resolvedPath = await resolveClaudePath("claude");

  // Verify the path exists and is executable
  const env = {
    ...process.env,
    PATH: `${process.env.PATH}:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin`,
  };

  try {
    await execAsync(`"${resolvedPath}" --version`, { timeout: 5000, env });
    return resolvedPath;
  } catch (error) {
    throw new Error(
      `Claude CLI not found at: ${resolvedPath}\nPlease install Claude Code from https://claude.com/code or specify the path in preferences.`
    );
  }
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

  // Extended environment with common binary locations
  const env = {
    ...process.env,
    PATH: `${process.env.PATH}:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin`,
  };

  onProgress?.("Preparing Claude CLI execution...");

  try {
    // Execute Claude CLI with the prompt
    // Using echo to pipe prompt via stdin to avoid shell escaping issues and command line length limits
    // Using --print flag for non-interactive output
    const command = `cd "${workingDir}" && echo ${JSON.stringify(prompt)} | "${claudePath}" --print`;

    onProgress?.("Executing Claude CLI...");

    const { stdout, stderr } = await execAsync(command, {
      env,
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer for large outputs
      timeout: 600000, // 10 minute timeout
    });

    if (stderr && stderr.includes("error") && !stdout) {
      throw new Error(`Claude CLI error: ${stderr}`);
    }

    if (stderr) {
      console.warn("Claude CLI stderr:", stderr);
    }

    onProgress?.("Claude CLI execution completed");

    return stdout;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("ENOENT") || error.message.includes("command not found")) {
        throw new Error(
          `Claude Code CLI not found at: ${claudePath}\nPlease install it from https://claude.ai/code or check the path.`
        );
      }

      // Build detailed error message
      let detailedError = `Failed to generate extension:\n\nError: ${error.message}`;

      // Include stack trace if available
      if (error.stack) {
        detailedError += `\n\nStack Trace:\n${error.stack}`;
      }

      // Include stderr and stdout if available (from exec error)
      const execError = error as any;
      if (execError.stderr) {
        detailedError += `\n\nStderr:\n${execError.stderr}`;
      }
      if (execError.stdout) {
        detailedError += `\n\nStdout:\n${execError.stdout}`;
      }

      // Include command info
      detailedError += `\n\nClaude Path: ${claudePath}`;
      detailedError += `\n\nWorking Directory: ${workingDir}`;
      detailedError += `\n\nCommand: cd "${workingDir}" && echo <prompt> | "${claudePath}" --print`;

      throw new Error(detailedError);
    }
    throw new Error("Failed to generate extension: Unknown error");
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
 * Check if Claude Code CLI is available
 */
export async function checkClaudeAvailable(): Promise<boolean> {
  try {
    await findClaudePath();
    return true;
  } catch {
    return false;
  }
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
