import * as fs from "fs";
import * as path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { BVService } from "./types";

const execAsync = promisify(exec);

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  statusCode?: number;
  method?: string;
  url?: string;
  fullLine: string;
}

/**
 * Parse Laravel log file and extract non-200 responses
 */
export async function getNon200Responses(service: BVService, limit = 20): Promise<LogEntry[]> {
  const logPath = path.join(service.path, "storage/logs/laravel.log");

  if (!fs.existsSync(logPath)) {
    return [];
  }

  try {
    // Read only the last 5000 lines of the log file to avoid memory issues with large files
    const { stdout: logContent } = await execAsync(`tail -5000 "${logPath}"`, {
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
    });
    const lines = logContent.split("\n");

    const entries: LogEntry[] = [];
    let currentEntry: LogEntry | null = null;

    // Process lines in reverse to get most recent first
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i];

      // Check if this is a new log entry (starts with [timestamp])
      const logMatch = line.match(/^\[(\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z)?)\]\s+(\w+\.\w+):\s+(.+)$/);

      if (logMatch) {
        // Save previous entry if it exists
        if (currentEntry) {
          entries.push(currentEntry);
          if (entries.length >= limit) break;
        }

        const [, timestamp, level, message] = logMatch;

        // Try to extract HTTP status code from the message
        const statusMatch = message.match(/\b([4-5]\d{2})\b/); // Match 4xx or 5xx status codes
        const methodMatch = message.match(/\b(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\b/i);
        const urlMatch = message.match(/(?:https?:\/\/[^\s]+|\/[^\s]*)/);

        const statusCode = statusMatch ? parseInt(statusMatch[1]) : undefined;

        // Only include entries with error status codes OR error/warning levels
        const isError = statusCode && statusCode >= 400;
        const isErrorLevel = level.toLowerCase().includes("error") || level.toLowerCase().includes("warning");

        if (isError || isErrorLevel) {
          currentEntry = {
            timestamp,
            level,
            message: message.substring(0, 500), // Limit message length
            statusCode,
            method: methodMatch ? methodMatch[1].toUpperCase() : undefined,
            url: urlMatch ? urlMatch[0] : undefined,
            fullLine: line,
          };
        } else {
          currentEntry = null;
        }
      } else if (currentEntry && line.trim()) {
        // This is a continuation of the previous log entry
        currentEntry.message = (line + "\n" + currentEntry.message).substring(0, 1000);
        currentEntry.fullLine = line + "\n" + currentEntry.fullLine;
      }
    }

    // Add the last entry
    if (currentEntry) {
      entries.push(currentEntry);
    }

    return entries;
  } catch (error) {
    console.error("Error reading log file:", error);
    return [];
  }
}

/**
 * Get a summary of recent errors
 */
export async function getErrorSummary(service: BVService): Promise<string> {
  const entries = await getNon200Responses(service, 5);

  if (entries.length === 0) {
    return "No recent errors";
  }

  const errorCounts: { [key: number]: number } = {};
  entries.forEach((entry) => {
    if (entry.statusCode) {
      errorCounts[entry.statusCode] = (errorCounts[entry.statusCode] || 0) + 1;
    }
  });

  const summary = Object.entries(errorCounts)
    .map(([code, count]) => `${count}x ${code}`)
    .join(", ");

  return summary || `${entries.length} errors`;
}
