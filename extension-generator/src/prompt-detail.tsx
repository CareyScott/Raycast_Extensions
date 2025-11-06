/**
 * Prompt Detail View
 * Shows detailed information about a generation prompt
 */

import { Action, ActionPanel, Detail, Icon, open } from "@raycast/api";
import { GenerationPrompt } from "./types";
import { formatTimestamp, formatDuration, getStatusIcon } from "./utils";
import { NewPromptForm } from "./new-prompt";
import { useNavigation } from "@raycast/api";

interface PromptDetailViewProps {
  prompt: GenerationPrompt;
  onUpdate: () => void;
}

export function PromptDetailView({ prompt, onUpdate }: PromptDetailViewProps) {
  const { push } = useNavigation();

  const markdown = generateMarkdown(prompt);

  return (
    <Detail
      markdown={markdown}
      navigationTitle="Generation Details"
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.Label title="Status" text={prompt.status} icon={getStatusIcon(prompt.status)} />
          <Detail.Metadata.Label title="Created" text={formatTimestamp(prompt.timestamp)} />
          {prompt.duration && <Detail.Metadata.Label title="Duration" text={formatDuration(prompt.duration)} />}
          {prompt.continueCount !== undefined && prompt.continueCount > 0 && (
            <Detail.Metadata.Label title="Continued" text={`${prompt.continueCount} time(s)`} />
          )}
          {prompt.result && (
            <>
              <Detail.Metadata.Separator />
              <Detail.Metadata.Label title="Extension Name" text={prompt.result.name} />
              <Detail.Metadata.Label title="Files Generated" text={String(prompt.result.files.length)} />
              <Detail.Metadata.Link
                title="Directory"
                text={prompt.result.directory}
                target={`file://${prompt.result.directory}`}
              />
            </>
          )}
        </Detail.Metadata>
      }
      actions={
        <ActionPanel>
          {prompt.result && (
            <>
              <Action.Open
                title="Open in Finder"
                target={prompt.result.directory}
                icon={Icon.Finder}
                shortcut={{ modifiers: ["cmd"], key: "o" }}
              />
              <Action.OpenWith
                path={prompt.result.directory}
                shortcut={{ modifiers: ["cmd", "shift"], key: "o" }}
              />
              <Action
                title="Open in Terminal"
                icon={Icon.Terminal}
                onAction={() => open(`${prompt.result?.directory}`, "Terminal")}
                shortcut={{ modifiers: ["cmd"], key: "t" }}
              />
            </>
          )}
          <Action
            title="Edit & Re-run"
            icon={Icon.Pencil}
            onAction={() => push(<NewPromptForm initialPrompt={prompt.prompt} onComplete={onUpdate} />)}
            shortcut={{ modifiers: ["cmd"], key: "e" }}
          />
          <Action.CopyToClipboard
            title="Copy Prompt"
            content={prompt.prompt}
            shortcut={{ modifiers: ["cmd"], key: "c" }}
          />
        </ActionPanel>
      }
    />
  );
}

function generateMarkdown(prompt: GenerationPrompt): string {
  let md = `# Extension Generation\n\n`;

  md += `## Prompt\n\n${prompt.prompt}\n\n`;

  md += `---\n\n`;

  if (prompt.status === "completed" && prompt.result) {
    md += `## ✅ Generation Successful\n\n`;
    md += `**Extension:** ${prompt.result.name}\n\n`;
    md += `**Summary:** ${prompt.result.summary}\n\n`;

    if (prompt.result.files.length > 0) {
      md += `### Generated Files (${prompt.result.files.length})\n\n`;

      // Group files by directory
      const filesByDir = new Map<string, string[]>();

      prompt.result.files.forEach((file) => {
        const dir = file.path.includes("/") ? file.path.split("/")[0] : "/";
        if (!filesByDir.has(dir)) {
          filesByDir.set(dir, []);
        }
        filesByDir.get(dir)?.push(file.path);
      });

      filesByDir.forEach((files, dir) => {
        md += `**${dir === "/" ? "Root" : dir}/**\n`;
        files.forEach((file) => {
          md += `- ${file}\n`;
        });
        md += `\n`;
      });
    }

    md += `### Next Steps\n\n`;
    md += `1. Open the extension directory in your editor\n`;
    md += `2. Run \`npm install\` to install dependencies\n`;
    md += `3. Run \`npm run dev\` to start development mode\n`;
    md += `4. Test the extension in Raycast\n`;
    md += `5. Make any necessary adjustments\n`;
  } else if (prompt.status === "failed") {
    md += `## ❌ Generation Failed\n\n`;
    if (prompt.error) {
      md += `**Error:** ${prompt.error}\n\n`;
    }
    md += `Please try again or modify your prompt for better results.\n`;
  } else if (prompt.status === "cancelled") {
    md += `## 🚫 Generation Cancelled\n\n`;
    md += `The generation was cancelled by the user.\n`;
  } else if (prompt.status === "generating") {
    md += `## ⚙️ Generation In Progress\n\n`;
    md += `Please wait while the extension is being generated...\n`;
  } else {
    md += `## ⏳ Generation Pending\n\n`;
    md += `The generation has not started yet.\n`;
  }

  return md;
}
