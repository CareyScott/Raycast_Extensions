import { exec } from "child_process";
import { promisify } from "util";
import { SpellCheckResult } from "./types";
import { parseClaudeResponse } from "./utils";

const execAsync = promisify(exec);

/**
 * Resolve the full path to Claude CLI
 */
async function resolveClaudePath(claudePath: string): Promise<string> {
  // If it's already an absolute path, use it
  if (claudePath.startsWith("/")) {
    return claudePath;
  }

  // Try to find claude in common locations
  const commonPaths = ["/opt/homebrew/bin/claude", "/usr/local/bin/claude", "/usr/bin/claude"];

  // Check common paths first
  for (const path of commonPaths) {
    try {
      const env = {
        ...process.env,
        PATH: `${process.env.PATH}:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin`,
      };
      await execAsync(`test -x "${path}"`, { timeout: 1000, env });
      return path;
    } catch {
      // Continue to next path
    }
  }

  // Try using 'which' to find it
  try {
    const env = {
      ...process.env,
      PATH: `${process.env.PATH}:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin`,
    };
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
 * Execute Claude Code CLI to perform spell checking
 */
export async function spellCheckWithClaude(
  text: string,
  claudePath: string,
  language: string
): Promise<SpellCheckResult> {
  // Resolve the full path to claude
  const resolvedPath = await resolveClaudePath(claudePath);

  const languageInstruction =
    language === "auto" ? "Detect the language automatically." : `The text is in ${language}.`;

  const prompt = `You are a spell checker. ${languageInstruction}

CRITICAL INSTRUCTIONS:
- Output ONLY the corrected text, nothing else
- NO explanations, NO markdown formatting, NO code blocks
- NO "here is" or "the corrected text is" or similar phrases
- Just the corrected text exactly as it should appear
- Preserve all original formatting (line breaks, spacing)
- If the text is already perfect, return it unchanged
- Rephrase to improve clarity only if there are spelling/grammar issues
- rephrase to improve readability

Text to check:
${text}

Corrected text:`;

  try {
    // Execute claude CLI with --print flag for non-interactive mode
    // Set PATH to include common installation locations
    const env = {
      ...process.env,
      PATH: `${process.env.PATH}:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin`,
    };

    // Use echo to pipe the prompt via stdin to avoid shell escaping issues
    const command = `echo ${JSON.stringify(prompt)} | "${resolvedPath}" --print`;

    const { stdout, stderr } = await execAsync(command, {
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      timeout: 120000, // 120 second timeout
      env,
    });

    if (stderr && stderr.includes("error") && !stdout) {
      throw new Error(`Claude CLI error: ${stderr}`);
    }

    // Clean up the response - remove markdown code blocks and extra formatting
    let correctedText = stdout.trim();

    // Remove markdown code blocks if present
    correctedText = correctedText.replace(/```[a-z]*\n?/g, "");

    // Remove common leading phrases
    correctedText = correctedText.replace(/^(Here is |The corrected text is:?|Corrected text:?)\s*/i, "");

    correctedText = correctedText.trim();

    return parseClaudeResponse(text, correctedText, language);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("ENOENT") || error.message.includes("command not found")) {
        throw new Error(
          `Claude Code CLI not found at: ${resolvedPath}\nPlease install it from https://claude.ai/code or check the path in preferences.`
        );
      }

      // Build detailed error message with all available information
      let detailedError = `Failed to check spelling:\n\nError: ${error.message}`;

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
      detailedError += `\n\nClaude Path: ${resolvedPath}`;
      detailedError += `\n\nCommand: echo <prompt> | "${resolvedPath}" --print`;

      throw new Error(detailedError);
    }
    throw new Error("Failed to check spelling: Unknown error");
  }
}

/**
 * Check if Claude Code CLI is available
 */
export async function checkClaudeAvailable(claudePath: string): Promise<boolean> {
  try {
    // Resolve the full path first
    const resolvedPath = await resolveClaudePath(claudePath);

    // Test by running a simple command with extended PATH
    const env = {
      ...process.env,
      PATH: `${process.env.PATH}:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin`,
    };
    await execAsync(`"${resolvedPath}" --help`, { timeout: 5000, env });
    return true;
  } catch {
    return false;
  }
}
