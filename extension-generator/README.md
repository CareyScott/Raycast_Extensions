# Extension Generator

Generate new Raycast extensions using Claude Code CLI. This extension analyzes your existing Raycast extensions and creates new ones based on your natural language prompts.

## Features

- **AI-Powered Generation**: Uses Claude Code CLI to generate complete Raycast extensions
- **Context-Aware**: Analyzes existing extensions in your project to maintain consistent patterns
- **Prompt History**: Keep track of all your generation attempts with full history
- **Edit & Re-run**: Easily modify and re-run previous prompts
- **Progress Tracking**: Real-time progress updates during generation
- **Timeout Handling**: Automatically prompts you after 10 minutes if generation is taking long
- **Detailed Results**: View all generated files and quick access to open in Finder/editor

## Requirements

- **Claude Code CLI**: Must be installed on your system
  - Install from: https://claude.com/code
  - The extension will auto-detect the CLI in common locations

## Usage

1. **Open Extension Generator**: Launch the extension from Raycast
2. **New Prompt**: Press `Cmd+N` to create a new generation prompt
3. **Describe Your Extension**: Write a detailed description of the extension you want to create
   - Be specific about features, commands, and functionality
   - Mention the extension name explicitly
   - Reference existing patterns if needed
4. **Wait for Generation**: The extension will analyze your codebase and generate the new extension
   - Progress updates will be shown
   - You'll be prompted if generation exceeds 10 minutes
5. **View Results**: Once completed, view the generated files and open the directory
6. **Install & Test**: Navigate to the extension directory, run `npm install`, then `npm run dev`

## Tips for Better Results

- **Be Specific**: Include detailed requirements about commands, UI, and functionality
- **Name It**: Explicitly specify the extension name in your prompt
- **Reference Patterns**: Mention if you want to follow patterns from existing extensions
- **Include APIs**: Specify any external services or APIs to integrate
- **UI Preferences**: Mention which Raycast components to use (List, Form, Detail, etc.)

## Example Prompts

```
Create an extension called "GitHub Stars" that lets me view and search my starred GitHub repositories.
It should have a List view showing repo names, descriptions, and star counts.
Include actions to open in browser and copy repo URL.
```

```
Build an extension named "Quick Notes" with two commands:
1. A form to create new notes with title and content
2. A list view to browse all notes with search and delete actions
Store notes in a JSON file in the user's home directory.
```

## Keyboard Shortcuts

- `Cmd+N` - New extension prompt
- `Cmd+E` - Edit and re-run selected prompt
- `Cmd+D` - Delete selected prompt
- `Cmd+Shift+D` - Clear all history
- `Cmd+O` - Open extension in Finder (in detail view)
- `Cmd+T` - Open in Terminal (in detail view)

## Troubleshooting

### Claude CLI Not Found

If you get a "Claude CLI not found" error:
1. Install Claude Code from https://claude.com/code
2. Or specify the path in extension preferences

### Generation Takes Too Long

- Complex extensions can take 5-10 minutes
- You'll be prompted after 10 minutes to continue or cancel
- Consider breaking complex extensions into smaller parts

### Generated Extension Has Issues

- Review the prompt and be more specific
- Check if dependencies need to be installed (`npm install`)
- Review generated code and make manual adjustments as needed

## Development

```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Build extension
npm run build

# Lint code
npm run lint

# Fix linting issues
npm run fix-lint
```

## License

MIT
