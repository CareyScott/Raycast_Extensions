# German to English Translator

Professional German translations for English words, phrases, and sentences tailored for FinTech app design.

## Features

- **Instant Translation**: Translate English text to German with FinTech-specific terminology
- **FinTech Focused**: Comprehensive database of 100+ financial technology terms
- **Quick Translate**: Translate clipboard content directly with a single command
- **Browse Terms**: Explore all available FinTech terms organized by category
- **Multiple Alternatives**: Get alternative translations when available
- **Context Aware**: Translations include context and category information

## Commands

### 1. Translate to German

The main translation interface where you can:
- Enter or paste English text
- View detailed translation results with alternatives
- Browse the complete FinTech terminology database
- Copy or paste translations directly

**Shortcuts:**
- `⌘V` - Paste from clipboard
- `⌘B` - Browse FinTech terms
- `⌘C` - Copy German translation
- `⌘⇧C` - Copy all alternatives

### 2. Quick Translate

Fast translation from clipboard:
- Automatically reads text from clipboard
- Translates using FinTech terminology
- Copies translation back to clipboard
- Shows result in HUD notification

Perfect for quick translations while working on your FinTech app design.

## FinTech Term Categories

The extension includes translations for:

- **Payment**: payment, transfer, refund, invoice, receipt, etc.
- **Account**: account, balance, profile, settings, etc.
- **Transaction**: pending, completed, failed, amount, recipient, etc.
- **Security**: password, authentication, 2FA, login, verification, etc.
- **UI Elements**: continue, cancel, submit, save, delete, back, next, etc.
- **Error Messages**: error, invalid, failed, not found, insufficient funds, etc.
- **Success Messages**: success, completed successfully, sent, received, etc.
- **General**: app, bank, card, currency, customer, support, etc.

## Usage Examples

**Example 1: Single Term**
```
Input: "payment"
Output: "Zahlung"
Alternatives: "Bezahlung"
```

**Example 2: Phrase**
```
Input: "send money"
Output: "Geld senden"
Alternatives: "Geld überweisen"
```

**Example 3: UI Button**
```
Input: "continue"
Output: "Weiter"
Alternatives: "Fortfahren"
```

**Example 4: Error Message**
```
Input: "insufficient funds"
Output: "unzureichendes Guthaben"
Alternatives: "nicht genug Guthaben"
```

## Development

### Prerequisites

- Node.js 20+
- Raycast (latest version)
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Run in development mode (with hot reload)
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Fix linting issues
npm run fix-lint
```

### Project Structure

```
german-to-english/
├── src/
│   ├── translate.tsx      # Main translation UI
│   ├── quick-translate.ts # Quick clipboard translation
│   ├── types.ts           # TypeScript interfaces
│   └── utils.ts           # Translation logic and term database
├── assets/
│   └── icon.png           # Extension icon
├── package.json           # Extension configuration
├── tsconfig.json          # TypeScript configuration
└── README.md              # This file
```

## Adding New Terms

To add new FinTech terms, edit `src/utils.ts` and add entries to the `FINTECH_TERMS` array:

```typescript
{
  english: "your term",
  german: "deine Übersetzung",
  alternatives: ["alternative 1", "alternative 2"],
  category: "payment" // or other category
}
```

## Notes

- **Formal vs. Informal**: All translations use formal German ("Sie") suitable for professional FinTech applications
- **Term Database**: The extension uses a curated database of FinTech terms. For general text translation, use a professional translation service
- **Alternatives**: When multiple translations are available, the most common one is shown first, with alternatives listed
- **Context**: Each translation includes context information to help you choose the right term

## License

MIT

## Support

For issues or feature requests, please open an issue in the repository.

## Version History

- **1.0.0** - Initial release with 100+ FinTech terms across 8 categories
