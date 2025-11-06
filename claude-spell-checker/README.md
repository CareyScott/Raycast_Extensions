# Claude Spell Checker

A Raycast extension that performs multilingual spell checking using Claude Code with a beautiful diff view to show changes.

## Features

- Multilingual spell and grammar checking powered by Claude AI
- Automatic language detection
- Beautiful side-by-side diff view showing all changes
- Support for 12+ languages
- Check text directly or from clipboard
- Copy corrected text or paste directly
- Runs Claude Code locally in the background

## Setup

1. Install [Claude Code](https://claude.ai/code)
2. Make sure the `claude` command is available in your PATH
3. Install this extension in Raycast

## Usage

### Spell Check with Claude

Type your text or paste from clipboard, select a language (or use auto-detect), and let Claude check for spelling and grammar errors.

### Spell Check Clipboard

Automatically checks the text currently in your clipboard.

## Commands

- `Spell Check with Claude` - Manual text input with language selection
- `Spell Check Clipboard` - Automatically check clipboard text

## Preferences

- **Default Language**: Set your preferred language for spell checking (default: Auto-detect)
- **Claude Code Path**: Path to Claude Code executable (default: `claude`)

## Supported Languages

- Auto-detect
- English
- Spanish
- French
- German
- Italian
- Portuguese
- Dutch
- Polish
- Russian
- Chinese
- Japanese
- Korean

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build the extension
npm run build

# Lint
npm run lint

# Fix linting issues
npm run fix-lint
```

## License

MIT
