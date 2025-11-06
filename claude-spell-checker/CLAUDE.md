# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Raycast extension called "Claude Spell Checker" that performs multilingual spell and grammar checking using Claude Code CLI running locally in the background. The extension provides a diff view showing changes side-by-side.

## Development Commands

```bash
# Development with hot reload
npm run dev

# Build the extension
npm run build

# Lint the code
npm run lint

# Auto-fix linting issues
npm run fix-lint

# Publish to Raycast Store
npm run publish
```

## Architecture

### Claude CLI Integration

The extension uses **local Claude Code CLI** instead of API calls:

- **Execution**: Uses Node.js `child_process.exec()` to run `claude --print` command
- **Path Resolution**: Automatically finds Claude CLI in common locations:
  - `/opt/homebrew/bin/claude` (Homebrew on Apple Silicon)
  - `/usr/local/bin/claude` (Homebrew on Intel)
  - `/usr/bin/claude` (System installation)
  - Falls back to `which claude` if not found in common locations
- **Environment**: Extends PATH to include common bin directories
- **Prompt Engineering**: Sends structured prompts with `--print` flag for non-interactive output
- **Response Parsing**: Cleans up Claude's stdout (removes markdown, explanations)
- **Error Handling**: Provides clear error messages with resolved path information

**Critical**: The extension requires Claude Code CLI to be installed. Users can configure a custom path in preferences if installed in a non-standard location.

### Spell Check Flow

1. **Input**: User provides text (manual input or clipboard)
2. **Language**: Auto-detect by default, with optional language override
3. **Path Resolution**: Automatically locates Claude CLI executable
4. **Processing**:
   - Resolve full path to `claude` executable
   - Execute `claude --print` with spell-check prompt
   - Clean up response (strip markdown, explanations)
   - Generate diff and change statistics
5. **Output**: Display results in Detail view with:
   - Side-by-side diff (removed/added lines)
   - Change count and similarity percentage
   - Metadata (languages, character counts)
   - Actions (copy, paste corrected text)

### Diff Generation Algorithm

Located in `utils.ts`:

- **Line-by-line comparison**: Splits text by newlines and compares
- **Word-level changes**: Tracks additions, deletions, replacements
- **Similarity calculation**: Uses Levenshtein distance algorithm
- **Formatting**: Generates unified diff format with `+` / `-` markers

### Command Structure

Two Raycast commands:

1. **spell-check** (`src/spell-check.tsx`): Form UI for manual text input
   - Text area for input
   - Language dropdown (auto-detect default)
   - Submit action triggers Claude CLI
   - Pushes to ResultDetail view on completion

2. **spell-check-clipboard** (`src/spell-check-clipboard.tsx`): Auto-loads from clipboard
   - Reads clipboard on mount via `useEffect()`
   - Automatically triggers spell check
   - Shows loading state during processing
   - Direct navigation to results

### React Patterns

- **Async execution**: All Claude CLI calls are async with proper error handling
- **Toast notifications**: Progress indicators for long-running operations
- **Navigation**: Uses `push()` from `@raycast/api` for result views
- **Preferences**: Accessed via `getPreferenceValues<Preferences>()`
- **Clipboard integration**: Both read (`readText()`) and write operations

## Key Files

- `src/types.ts`: TypeScript interfaces (SpellCheckResult, DiffLine, TextChange)
- `src/claude-cli.ts`: Claude Code CLI wrapper with exec() calls
- `src/utils.ts`: Diff generation, similarity calculation, text parsing
- `src/spell-check.tsx`: Main form-based command
- `src/spell-check-clipboard.tsx`: Clipboard-based command

## Constants

- `LANGUAGE_NAMES`: Map of ISO 639-1 codes to language names
- Temporary file pattern: `claude-spell-check-${Date.now()}.txt`
- Default Claude path: `"claude"` (expects in PATH)

## Error Handling

- **ENOENT errors**: Catches missing Claude CLI and shows helpful message
- **Empty clipboard**: Validates clipboard content before processing
- **Timeout**: 60-second timeout on Claude CLI execution
- **Temp file cleanup**: Always runs cleanup in try/finally blocks

## TypeScript Configuration

- Target: ES2023
- JSX: react-jsx (Raycast uses React)
- Strict mode enabled
- Module: CommonJS (required by Raycast)

## Testing Locally

To test the extension:
1. Ensure `claude` CLI is available: `which claude`
2. Run `npm run dev` to start Raycast development mode
3. Open Raycast and search for "Spell Check with Claude"
4. Test with various languages and text samples
