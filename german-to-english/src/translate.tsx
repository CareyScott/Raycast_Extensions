import {
  Action,
  ActionPanel,
  Clipboard,
  Color,
  Detail,
  Form,
  Icon,
  showToast,
  Toast,
  useNavigation,
} from "@raycast/api";
import { useState } from "react";
import { TranslationResult } from "./types";
import {
  formatTranslationResult,
  translateToGerman,
  getAllCategories,
  getTermsByCategory,
  formatCategoryName,
} from "./utils";

export default function Command() {
  const { push } = useNavigation();
  const [text, setText] = useState("");
  const [showBrowse, setShowBrowse] = useState(false);

  async function handleSubmit() {
    if (!text.trim()) {
      await showToast(
        Toast.Style.Failure,
        "Empty text",
        "Please enter some text to translate",
      );
      return;
    }

    const toast = await showToast({
      style: Toast.Style.Animated,
      title: "Translating...",
      message: "Processing your text",
    });

    try {
      const result = translateToGerman(text);
      await toast.hide();
      push(<TranslationDetail result={result} />);
    } catch (error) {
      await toast.hide();
      await showToast(
        Toast.Style.Failure,
        "Translation failed",
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  }

  function handleBrowseTerms() {
    push(<BrowseTerms />);
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Translate"
            icon={Icon.Globe}
            onSubmit={handleSubmit}
          />
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
          <Action
            title="Browse FinTech Terms"
            icon={Icon.Book}
            shortcut={{ modifiers: ["cmd"], key: "b" }}
            onAction={handleBrowseTerms}
          />
        </ActionPanel>
      }
    >
      <Form.TextArea
        id="text"
        title="English Text"
        placeholder="Enter English text to translate to German..."
        value={text}
        onChange={setText}
        enableMarkdown={false}
      />
      <Form.Description text="Specialized for FinTech terminology. Press ⌘B to browse available terms." />
    </Form>
  );
}

function TranslationDetail({ result }: { result: TranslationResult }) {
  const isNotFound = result.translated.startsWith("⚠️");

  const markdown = formatTranslationResult(result);

  return (
    <Detail
      markdown={markdown}
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.Label
            title="Status"
            text={isNotFound ? "No Match" : "Translated"}
            icon={
              isNotFound
                ? { source: Icon.XMarkCircle, tintColor: Color.Orange }
                : { source: Icon.Check, tintColor: Color.Green }
            }
          />
          {result.category && (
            <Detail.Metadata.Label
              title="Category"
              text={formatCategoryName(result.category)}
            />
          )}
          {result.alternatives && result.alternatives.length > 0 && (
            <Detail.Metadata.Label
              title="Alternatives"
              text={result.alternatives.length.toString()}
            />
          )}
          <Detail.Metadata.Separator />
          <Detail.Metadata.Label
            title="Original Length"
            text={`${result.original.length} characters`}
          />
          <Detail.Metadata.Label
            title="Translation Length"
            text={`${result.translated.length} characters`}
          />
        </Detail.Metadata>
      }
      actions={
        <ActionPanel>
          <Action.CopyToClipboard
            title="Copy German Translation"
            content={result.translated}
            shortcut={{ modifiers: ["cmd"], key: "c" }}
          />
          <Action.Paste
            title="Paste German Translation"
            content={result.translated}
            shortcut={{ modifiers: ["cmd"], key: "v" }}
          />
          {result.alternatives && result.alternatives.length > 0 && (
            <Action.CopyToClipboard
              title="Copy All Alternatives"
              content={result.alternatives.join(", ")}
              shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
            />
          )}
          <Action.CopyToClipboard
            title="Copy Original Text"
            content={result.original}
            shortcut={{ modifiers: ["cmd", "shift"], key: "o" }}
          />
        </ActionPanel>
      }
    />
  );
}

function BrowseTerms() {
  const categories = getAllCategories();
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const terms = getTermsByCategory(selectedCategory);

  let markdown = `# FinTech Terms: ${formatCategoryName(selectedCategory)}\n\n`;
  markdown += `Found ${terms.length} terms in this category.\n\n`;
  markdown += "| English | German | Alternatives |\n";
  markdown += "|---------|--------|-------------|\n";

  terms.forEach((term) => {
    const alternatives = term.alternatives ? term.alternatives.join(", ") : "-";
    markdown += `| ${term.english} | **${term.german}** | ${alternatives} |\n`;
  });

  return (
    <Detail
      markdown={markdown}
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.Label
            title="Category"
            text={formatCategoryName(selectedCategory)}
          />
          <Detail.Metadata.Label title="Terms" text={terms.length.toString()} />
          <Detail.Metadata.Separator />
          {categories.map((cat) => (
            <Detail.Metadata.Label
              key={cat}
              title={formatCategoryName(cat)}
              text={getTermsByCategory(cat).length.toString()}
            />
          ))}
        </Detail.Metadata>
      }
      actions={
        <ActionPanel>
          {categories.map((cat) => (
            <Action
              key={cat}
              title={`Show ${formatCategoryName(cat)}`}
              icon={Icon.Filter}
              onAction={() => setSelectedCategory(cat)}
            />
          ))}
          <Action.CopyToClipboard
            title="Copy All Terms"
            content={terms.map((t) => `${t.english}: ${t.german}`).join("\n")}
            shortcut={{ modifiers: ["cmd"], key: "c" }}
          />
        </ActionPanel>
      }
    />
  );
}
