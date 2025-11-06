/**
 * Extension Generator - Main Command
 * Shows list of generation prompts with history
 */

import {
  Action,
  ActionPanel,
  Alert,
  Color,
  confirmAlert,
  Icon,
  List,
  showToast,
  Toast,
  useNavigation,
} from "@raycast/api";
import { useEffect, useState } from "react";
import { loadHistory, deletePrompt, clearHistory } from "./storage";
import { GenerationPrompt } from "./types";
import { formatTimestamp, formatDuration, getStatusIcon, truncate } from "./utils";
import { NewPromptForm } from "./new-prompt";
import { PromptDetailView } from "./prompt-detail";

export default function Command() {
  const [prompts, setPrompts] = useState<GenerationPrompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { push } = useNavigation();

  // Load prompt history
  useEffect(() => {
    refreshPrompts();
  }, []);

  const refreshPrompts = () => {
    setIsLoading(true);
    const history = loadHistory();
    setPrompts(history.prompts);
    setIsLoading(false);
  };

  const handleDelete = async (promptId: string) => {
    const confirmed = await confirmAlert({
      title: "Delete Prompt",
      message: "Are you sure you want to delete this prompt from history?",
      primaryAction: {
        title: "Delete",
        style: Alert.ActionStyle.Destructive,
      },
    });

    if (confirmed) {
      try {
        deletePrompt(promptId);
        await showToast({
          style: Toast.Style.Success,
          title: "Prompt deleted",
        });
        refreshPrompts();
      } catch (error) {
        await showToast({
          style: Toast.Style.Failure,
          title: "Failed to delete prompt",
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }
  };

  const handleClearHistory = async () => {
    const confirmed = await confirmAlert({
      title: "Clear All History",
      message: "Are you sure you want to delete all prompts from history? This cannot be undone.",
      primaryAction: {
        title: "Clear All",
        style: Alert.ActionStyle.Destructive,
      },
    });

    if (confirmed) {
      try {
        clearHistory();
        await showToast({
          style: Toast.Style.Success,
          title: "History cleared",
        });
        refreshPrompts();
      } catch (error) {
        await showToast({
          style: Toast.Style.Failure,
          title: "Failed to clear history",
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }
  };

  const getStatusColor = (status: GenerationPrompt["status"]): Color => {
    switch (status) {
      case "completed":
        return Color.Green;
      case "failed":
        return Color.Red;
      case "generating":
        return Color.Blue;
      case "cancelled":
        return Color.Orange;
      default:
        return Color.SecondaryText;
    }
  };

  return (
    <List
      isLoading={isLoading}
      searchBarPlaceholder="Search generation prompts..."
      actions={
        <ActionPanel>
          <Action
            title="New Extension Prompt"
            icon={Icon.Plus}
            onAction={() => push(<NewPromptForm onComplete={refreshPrompts} />)}
            shortcut={{ modifiers: ["cmd"], key: "n" }}
          />
        </ActionPanel>
      }
    >
      <List.EmptyView
        icon={Icon.Rocket}
        title="No Extensions Generated Yet"
        description="Create your first Raycast extension by pressing Cmd+N"
        actions={
          <ActionPanel>
            <Action
              title="New Extension Prompt"
              icon={Icon.Plus}
              onAction={() => push(<NewPromptForm onComplete={refreshPrompts} />)}
              shortcut={{ modifiers: ["cmd"], key: "n" }}
            />
          </ActionPanel>
        }
      />

      {prompts.length > 0 && (
        <>
          <List.Section title="Recent Generations">
            {prompts.map((prompt) => (
              <List.Item
                key={prompt.id}
                title={truncate(prompt.prompt, 80)}
                subtitle={formatTimestamp(prompt.timestamp)}
                accessories={[
                  {
                    text: prompt.duration ? formatDuration(prompt.duration) : undefined,
                    icon: prompt.duration ? Icon.Clock : undefined,
                  },
                  {
                    tag: {
                      value: prompt.status,
                      color: getStatusColor(prompt.status),
                    },
                    icon: getStatusIcon(prompt.status),
                  },
                ]}
                actions={
                  <ActionPanel>
                    <Action
                      title="View Details"
                      icon={Icon.Eye}
                      onAction={() => push(<PromptDetailView prompt={prompt} onUpdate={refreshPrompts} />)}
                    />
                    <Action
                      title="Edit & Re-run"
                      icon={Icon.Pencil}
                      onAction={() => push(<NewPromptForm initialPrompt={prompt.prompt} onComplete={refreshPrompts} />)}
                      shortcut={{ modifiers: ["cmd"], key: "e" }}
                    />
                    <Action
                      title="New Extension Prompt"
                      icon={Icon.Plus}
                      onAction={() => push(<NewPromptForm onComplete={refreshPrompts} />)}
                      shortcut={{ modifiers: ["cmd"], key: "n" }}
                    />
                    <Action
                      title="Delete"
                      icon={Icon.Trash}
                      style={Action.Style.Destructive}
                      onAction={() => handleDelete(prompt.id)}
                      shortcut={{ modifiers: ["cmd"], key: "d" }}
                    />
                    <Action
                      title="Clear All History"
                      icon={Icon.DeleteDocument}
                      style={Action.Style.Destructive}
                      onAction={handleClearHistory}
                      shortcut={{ modifiers: ["cmd", "shift"], key: "d" }}
                    />
                  </ActionPanel>
                }
              />
            ))}
          </List.Section>
        </>
      )}
    </List>
  );
}
