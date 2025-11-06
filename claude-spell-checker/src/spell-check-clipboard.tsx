import {
  Action,
  ActionPanel,
  Clipboard,
  Color,
  Detail,
  getPreferenceValues,
  Icon,
  showToast,
  Toast,
} from "@raycast/api";
import { useEffect, useState } from "react";
import { spellCheckWithClaude } from "./claude-cli";
import { SpellCheckResult } from "./types";
import { calculateSimilarity, formatLanguageName, generateSideBySideDiff } from "./utils";

interface Preferences {
  defaultLanguage: string;
  claudePath: string;
}

export default function Command() {
  const preferences = getPreferenceValues<Preferences>();
  const [result, setResult] = useState<SpellCheckResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkClipboard() {
      const toast = await showToast({
        style: Toast.Style.Animated,
        title: "Reading clipboard...",
      });

      try {
        const clipboardText = await Clipboard.readText();

        if (!clipboardText) {
          throw new Error("Clipboard is empty");
        }

        await toast.hide();

        const checkToast = await showToast({
          style: Toast.Style.Animated,
          title: "Checking spelling...",
          message: "Claude is analyzing your text",
        });

        const claudePath = preferences.claudePath || "claude";
        const language = preferences.defaultLanguage || "auto";
        const spellCheckResult = await spellCheckWithClaude(clipboardText, claudePath, language);

        setResult(spellCheckResult);
        await checkToast.hide();

        if (spellCheckResult.hasChanges) {
          await showToast({
            style: Toast.Style.Success,
            title: "Spell check complete",
            message: `Found ${spellCheckResult.changes.length} changes`,
          });
        } else {
          await showToast({
            style: Toast.Style.Success,
            title: "No errors found",
            message: "Your text is already correct",
          });
        }
      } catch (err) {
        await toast.hide();
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        // Show error in detail view instead of toast
      } finally {
        setIsLoading(false);
      }
    }

    checkClipboard();
  }, []);

  if (isLoading) {
    return <Detail isLoading={true} markdown="Loading..." />;
  }

  if (error) {
    const markdown = `# Spell Check Error

\`\`\`
${error}
\`\`\`

---

**Troubleshooting:**
- Ensure Claude Code CLI is installed: https://claude.ai/code
- Check the Claude Path setting in extension preferences
- Verify Claude CLI is accessible from terminal: \`claude --help\`
`;

    return (
      <Detail
        markdown={markdown}
        metadata={
          <Detail.Metadata>
            <Detail.Metadata.Label
              title="Status"
              text="Error"
              icon={{ source: Icon.XMarkCircle, tintColor: Color.Red }}
            />
          </Detail.Metadata>
        }
        actions={
          <ActionPanel>
            <Action.CopyToClipboard
              title="Copy Error Details"
              content={error}
              shortcut={{ modifiers: ["cmd"], key: "c" }}
            />
            <Action.OpenInBrowser
              title="Open Claude Code Installation Guide"
              url="https://claude.ai/code"
              shortcut={{ modifiers: ["cmd"], key: "o" }}
            />
          </ActionPanel>
        }
      />
    );
  }

  if (!result) {
    return <Detail markdown="# Error\n\nNo result available" />;
  }

  const { originalText, correctedText, hasChanges, detectedLanguage } = result;
  const diff = generateSideBySideDiff(originalText, correctedText);
  const similarity = calculateSimilarity(originalText, correctedText);
  const changeCount = result.changes.length;

  const markdown = hasChanges
    ? `# Spell Check Results

${detectedLanguage !== "auto" ? `**Language:** ${formatLanguageName(detectedLanguage)}` : ""}
**Changes detected:** ${changeCount}
**Similarity:** ${similarity}%

## Differences

\`\`\`diff
${diff}
\`\`\`

## Corrected Text

${correctedText}
`
    : `# Spell Check Results

${detectedLanguage !== "auto" ? `**Language:** ${formatLanguageName(detectedLanguage)}` : ""}

✅ **No errors found!** Your text is already correct.

## Text

${originalText}
`;

  return (
    <Detail
      markdown={markdown}
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.Label
            title="Status"
            text={hasChanges ? "Changes Made" : "No Changes"}
            icon={
              hasChanges
                ? { source: Icon.Pencil, tintColor: Color.Orange }
                : { source: Icon.Check, tintColor: Color.Green }
            }
          />
          {detectedLanguage !== "auto" && (
            <Detail.Metadata.Label title="Language" text={formatLanguageName(detectedLanguage)} />
          )}
          <Detail.Metadata.Label title="Changes" text={changeCount.toString()} />
          <Detail.Metadata.Label title="Similarity" text={`${similarity}%`} />
          <Detail.Metadata.Separator />
          <Detail.Metadata.Label title="Original Length" text={`${originalText.length} characters`} />
          <Detail.Metadata.Label title="Corrected Length" text={`${correctedText.length} characters`} />
        </Detail.Metadata>
      }
      actions={
        <ActionPanel>
          <Action.CopyToClipboard
            title="Copy Corrected Text"
            content={correctedText}
            shortcut={{ modifiers: ["cmd"], key: "c" }}
          />
          <Action.CopyToClipboard
            title="Copy Diff"
            content={diff}
            shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
          />
          <Action.Paste
            title="Paste Corrected Text"
            content={correctedText}
            shortcut={{ modifiers: ["cmd"], key: "v" }}
          />
          {hasChanges && (
            <Action.CopyToClipboard
              title="Copy Original Text"
              content={originalText}
              shortcut={{ modifiers: ["cmd", "shift"], key: "o" }}
            />
          )}
        </ActionPanel>
      }
    />
  );
}
