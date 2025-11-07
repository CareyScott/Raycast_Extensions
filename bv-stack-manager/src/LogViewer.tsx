import React, { useEffect, useState } from "react";
import { Action, ActionPanel, Color, Detail, Icon, List } from "@raycast/api";
import { BVService } from "./types";
import { getNon200Responses, LogEntry } from "./logs";

interface LogViewerProps {
  service: BVService;
}

export default function LogViewer({ service }: LogViewerProps) {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function loadLogs() {
    setIsLoading(true);
    try {
      const logs = await getNon200Responses(service, 50);
      setEntries(logs);
    } catch (error) {
      console.error("Error loading logs:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadLogs();
  }, []);

  function getStatusColor(statusCode?: number): Color {
    if (!statusCode) return Color.Red;
    if (statusCode >= 500) return Color.Red;
    if (statusCode >= 400) return Color.Orange;
    return Color.Yellow;
  }

  function getStatusIcon(statusCode?: number): Icon {
    if (!statusCode) return Icon.XMarkCircle;
    if (statusCode >= 500) return Icon.XMarkCircle;
    if (statusCode >= 400) return Icon.ExclamationMark;
    return Icon.Warning;
  }

  return (
    <List
      isLoading={isLoading}
      navigationTitle={`${service.displayName} - Recent Errors`}
      searchBarPlaceholder="Search errors..."
    >
      {entries.length === 0 ? (
        <List.EmptyView
          icon={{ source: Icon.CheckCircle, tintColor: Color.Green }}
          title="No Recent Errors"
          description="No error responses found in the Laravel log file"
        />
      ) : (
        <List.Section title={`${entries.length} Recent Errors`}>
          {entries.map((entry, index) => {
            const title = entry.statusCode
              ? `${entry.statusCode} - ${entry.method || "REQUEST"} ${entry.url || ""}`
              : entry.message.substring(0, 100);

            const subtitle = new Date(entry.timestamp).toLocaleString();

            return (
              <List.Item
                key={index}
                title={title}
                subtitle={subtitle}
                icon={{
                  source: getStatusIcon(entry.statusCode),
                  tintColor: getStatusColor(entry.statusCode),
                }}
                accessories={[
                  {
                    tag: {
                      value: entry.level.split(".")[1]?.toUpperCase() || entry.level,
                      color: getStatusColor(entry.statusCode),
                    },
                  },
                ]}
                actions={
                  <ActionPanel>
                    <Action.Push
                      title="View Details"
                      icon={Icon.Document}
                      target={<LogDetailView entry={entry} service={service} />}
                    />
                    <Action.CopyToClipboard
                      title="Copy Error Message"
                      content={entry.message}
                      shortcut={{ modifiers: ["cmd"], key: "c" }}
                    />
                    <Action.CopyToClipboard
                      title="Copy Full Log Entry"
                      content={entry.fullLine}
                      shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
                    />
                    <Action
                      title="Refresh Logs"
                      icon={Icon.ArrowClockwise}
                      onAction={loadLogs}
                      shortcut={{ modifiers: ["cmd"], key: "r" }}
                    />
                    <Action.ShowInFinder
                      title="Show Log File"
                      path={`${service.path}/storage/logs/laravel.log`}
                    />
                  </ActionPanel>
                }
              />
            );
          })}
        </List.Section>
      )}
    </List>
  );
}

interface LogDetailViewProps {
  entry: LogEntry;
  service: BVService;
}

function LogDetailView({ entry, service }: LogDetailViewProps) {
  const markdown = `
# Error Details

**Status Code:** ${entry.statusCode || "N/A"}
**Method:** ${entry.method || "N/A"}
**URL:** ${entry.url || "N/A"}
**Level:** ${entry.level}
**Time:** ${new Date(entry.timestamp).toLocaleString()}

---

## Message

\`\`\`
${entry.message}
\`\`\`

---

## Full Log Entry

\`\`\`
${entry.fullLine}
\`\`\`
`;

  return (
    <Detail
      markdown={markdown}
      navigationTitle="Error Details"
      actions={
        <ActionPanel>
          <Action.CopyToClipboard title="Copy Error Message" content={entry.message} />
          <Action.CopyToClipboard title="Copy Full Log Entry" content={entry.fullLine} />
          <Action.ShowInFinder title="Show Log File" path={`${service.path}/storage/logs/laravel.log`} />
        </ActionPanel>
      }
    />
  );
}
