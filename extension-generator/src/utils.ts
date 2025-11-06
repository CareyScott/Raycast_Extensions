/**
 * Utility Functions
 */

import { GenerationPrompt } from "./types";

/**
 * Generate a unique ID for a prompt
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) {
    return "Just now";
  } else if (diffMins < 60) {
    return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  } else {
    return date.toLocaleDateString();
  }
}

/**
 * Format duration in milliseconds to human-readable string
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    const remainingMins = minutes % 60;
    return `${hours}h ${remainingMins}m`;
  } else if (minutes > 0) {
    const remainingSecs = seconds % 60;
    return `${minutes}m ${remainingSecs}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Get status icon for a generation prompt
 */
export function getStatusIcon(status: GenerationPrompt["status"]): string {
  switch (status) {
    case "pending":
      return "⏳";
    case "generating":
      return "⚙️";
    case "completed":
      return "✅";
    case "failed":
      return "❌";
    case "cancelled":
      return "🚫";
    default:
      return "❓";
  }
}

/**
 * Get status color for display
 */
export function getStatusColor(status: GenerationPrompt["status"]): string {
  switch (status) {
    case "completed":
      return "green";
    case "failed":
      return "red";
    case "generating":
      return "blue";
    case "cancelled":
      return "orange";
    default:
      return "gray";
  }
}

/**
 * Truncate text to a maximum length
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 3) + "...";
}

/**
 * Convert kebab-case to Title Case
 */
export function kebabToTitle(kebab: string): string {
  return kebab
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Convert Title Case to kebab-case
 */
export function titleToKebab(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Validate extension name (kebab-case, lowercase, alphanumeric with hyphens)
 */
export function validateExtensionName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: "Extension name cannot be empty" };
  }

  if (name !== name.toLowerCase()) {
    return { valid: false, error: "Extension name must be lowercase" };
  }

  if (!/^[a-z0-9-]+$/.test(name)) {
    return { valid: false, error: "Extension name can only contain lowercase letters, numbers, and hyphens" };
  }

  if (name.startsWith("-") || name.endsWith("-")) {
    return { valid: false, error: "Extension name cannot start or end with a hyphen" };
  }

  if (name.includes("--")) {
    return { valid: false, error: "Extension name cannot contain consecutive hyphens" };
  }

  return { valid: true };
}
