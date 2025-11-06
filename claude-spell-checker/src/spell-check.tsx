import {
  Action,
  ActionPanel,
  Clipboard,
  Color,
  Detail,
  Form,
  getPreferenceValues,
  Icon,
  showToast,
  Toast,
  useNavigation,
} from "@raycast/api";
import { useState } from "react";
import { spellCheckWithClaude } from "./claude-cli";
import { LANGUAGE_NAMES, SpellCheckResult } from "./types";
import { calculateSimilarity, formatLanguageName, generateSideBySideDiff } from "./utils";

interface Preferences {
  defaultLanguage: string;
  claudePath: string;
}

export default function Command() {
  const preferences = getPreferenceValues<Preferences>();
  const { push } = useNavigation();
  const [text, setText] = useState("");
  const [language, setLanguage] = useState(preferences.defaultLanguage || "auto");

  async function handleSubmit() {
    if (!text.trim()) {
      await showToast(Toast.Style.Failure, "Empty text", "Please enter some text to check");
      return;
    }

    const toast = await showToast({
      style: Toast.Style.Animated,
      title: "Checking spelling...",
      message: "Claude is analyzing your text",
    });

    try {
      const claudePath = preferences.claudePath || "claude";
      const result = await spellCheckWithClaude(text, claudePath, language);

      await toast.hide();

      // Show results
      push(<ResultDetail result={result} />);
    } catch (error) {
      await toast.hide();

      // Show error in detail view instead of toast
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      push(<ErrorDetail errorMessage={errorMessage} />);
    }
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Check Spelling" icon={Icon.Check} onSubmit={handleSubmit} />
          <Action
            title="Paste from Clipboard"
            icon={Icon.Clipboard}
            shortcut={{ modifiers: ["cmd"], key: "v" }}
            onAction={async () => {
              const clipboardText = await Clipboard.readText();
              if (clipboardText) {
                setText(clipboardText);
              }
            }}
          />
        </ActionPanel>
      }
    >
      <Form.TextArea
        id="text"
        title="Text to Check"
        placeholder="Enter or paste text to check for spelling and grammar errors..."
        value={text}
        onChange={setText}
        enableMarkdown={false}
      />
      <Form.Dropdown id="language" title="Language" value={language} onChange={setLanguage}>
        {Object.entries(LANGUAGE_NAMES).map(([code, name]) => (
          <Form.Dropdown.Item key={code} value={code} title={name} />
        ))}
      </Form.Dropdown>
      <Form.Description text="Tip: Claude will detect and correct spelling, grammar, and punctuation errors." />
    </Form>
  );
}

function ResultDetail({ result }: { result: SpellCheckResult }) {
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
            <>
              <Action.CopyToClipboard
                title="Copy Original Text"
                content={originalText}
                shortcut={{ modifiers: ["cmd", "shift"], key: "o" }}
              />
            </>
          )}
        </ActionPanel>
      }
    />
  );
}

function ErrorDetail({ errorMessage }: { errorMessage: string }) {
  const markdown = `# Spell Check Error

\`\`\`
${errorMessage}
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
            content={errorMessage}
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
