# CLAUDE.md

This file provides guidance to Claude Code when working with this extension.

## Project Overview

This is the **Extension Generator** - a meta Raycast extension that generates other Raycast extensions using Claude Code CLI. It analyzes existing extensions in the project to maintain consistent patterns and generates new extensions based on natural language prompts.

## Architecture

### Core Components

1. **Analyzer** (`src/analyzer.ts`)
   - Scans project directory for existing extensions
   - Extracts patterns, file structures, and common practices
   - Generates context for Claude CLI

2. **Generator** (`src/generator.ts`)
   - Orchestrates the generation process
   - Handles timeouts and user confirmation
   - Calls Claude CLI with context-rich prompts
   - Tracks progress through multiple stages

3. **Storage** (`src/storage.ts`)
   - File-based persistence at `~/.raycast-extension-generator/prompt-history.json`
   - Stores all generation prompts and results
   - CRUD operations for prompt history

4. **Claude CLI Integration** (`src/claude-cli.ts`)
   - Executes Claude Code CLI
   - Auto-detects CLI path in common locations
   - Handles output parsing and error reporting

### UI Components

- **index.tsx**: Main List view showing prompt history
- **new-prompt.tsx**: Form for creating new generation prompts
- **prompt-detail.tsx**: Detail view showing generation results

### Data Model

```typescript
interface GenerationPrompt {
  id: string;
  timestamp: string;
  prompt: string;
  status: "pending" | "generating" | "completed" | "failed" | "cancelled";
  result?: GeneratedExtension;
  error?: string;
  duration?: number;
  continueCount?: number;
}
```

## Key Features

### 10-Minute Timeout

The generator includes a timeout mechanism that prompts users after 10 minutes:
- Checks elapsed time during generation stages
- Shows confirmation dialog asking to continue or cancel
- Tracks `continueCount` for analytics

### Context-Aware Generation

Before generating, the extension:
1. Scans all sibling directories for Raycast extensions
2. Extracts file structures, commands, and patterns
3. Generates a comprehensive context string
4. Includes this context in the Claude CLI prompt

### Progress Tracking

Generation goes through 5 stages:
1. **analyzing**: Scanning existing extensions
2. **planning**: Building generation prompt
3. **generating**: Executing Claude CLI
4. **writing**: Finalizing files
5. **completed**: Done

Each stage updates the UI with progress percentage.

## Claude CLI Integration

The extension uses **local Claude Code CLI** via subprocess execution:

- **Path Resolution**: Automatically finds Claude CLI in common locations:
  - `/opt/homebrew/bin/claude` (Homebrew on Apple Silicon)
  - `/usr/local/bin/claude` (Homebrew on Intel)
  - `/usr/bin/claude` (System installation)
  - Falls back to `which claude` if not found
- **Environment**: Extends PATH to include common bin directories
- **Execution**: Uses `cd <dir> && claude --yes "<prompt>"` pattern
- **Verification**: Uses `test -x` to verify executable exists
- **Error Handling**: Provides detailed error messages with:
  - ENOENT detection for missing CLI
  - Stack traces and stderr/stdout output
  - Resolved path and command information
- **Timeout**: 10-minute timeout with user confirmation prompt

The prompt includes:
- User's requirements
- Full codebase context from analyzer
- Specific instructions about structure and patterns
- Reference to existing extensions

## Development Commands

```bash
npm run dev      # Hot reload development
npm run build    # Build extension
npm run lint     # Check linting
npm run fix-lint # Auto-fix issues
```

## Important Notes

- **No Claude API Key Required**: Uses local Claude CLI, not API
- **File-Based Storage**: History stored in home directory, not Raycast storage
- **Extension Names**: Auto-extracts from prompt or generates based on keywords
- **Error Handling**: All errors are caught, logged, and saved to prompt history
- **Cancellation**: Users can cancel during generation or at timeout prompt

## Common Issues

1. **Claude CLI Not Found**: Check common paths or user preference
2. **Directory Conflicts**: Validates extension name doesn't already exist
3. **Long Generation**: 10-minute timeout with continuation prompt
4. **Parse Errors**: Claude output parsing is resilient to format changes
