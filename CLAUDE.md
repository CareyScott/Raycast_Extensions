# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Raycast extension called "Cleaner Payment Tracker" that tracks cleaning work hours and payments with automatic €5 rounding. The extension is located in the `payment-for-work/` directory.

## Development Commands

All commands should be run from the `payment-for-work/` directory:

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

### Data Storage Architecture

The extension uses a **file-based persistence model** (not Raycast's built-in storage API):

- **Storage Location**: `~/.raycast-cleaner-tracker/cleaner-data.json`
- **Data Structure**: Single JSON file containing:
  - `workEntries[]`: Array of work sessions with hours, earnings, optional start/end times
  - `payments[]`: Array of payment records
  - `currentRemainder`: Running total of unpaid amount (currently unused)

**Critical**: All data mutations must go through `loadData()` → modify → `saveData()` cycle in `storage.ts`. Direct file manipulation will cause data loss.

### Payment Calculation Logic

The extension implements a **€5 rounding system** to simplify cash payments:

1. Total unpaid = sum(all work hours × €15/hour) - sum(all payments)
2. Suggested payment = floor(unpaid / 5) × 5
3. Remainder carries forward to next payment cycle

This logic is centralized in `utils.ts:calculatePayment()` and `utils.ts:calculateUnpaidAmount()`.

### Time Entry Modes

Work entries support two input methods (handled in `index.tsx:AddHoursForm`):

1. **Direct hours**: User enters decimal hours (e.g., 3.5)
2. **Time range**: User enters start/end times (HH:mm format), hours auto-calculated via `utils.ts:calculateHoursFromTimes()`
   - Supports overnight shifts (end time < start time adds 24 hours)
   - Validation ensures valid 24-hour format

Both modes use the same `WorkEntry` type but optional `startTime`/`endTime` fields preserve the input method.

### Command Structure

The extension provides 3 Raycast commands (defined in `package.json`):

1. **index** (`src/index.tsx`): Main view with List UI
   - Shows unpaid balance, recent work entries, payment history
   - Forms for adding hours and making payments
   - Delete actions for entries/payments
2. **quick-add** (`src/quick-add.ts`): No-view command with arguments
   - Fast HUD-based hour entry
   - Takes `hours` (required) and `notes` (optional) arguments
3. **status** (`src/status.ts`): No-view command
   - Shows HUD with current balance and suggested payment

### React Patterns

- Uses Raycast's `useNavigation()` hook for form navigation (push/pop)
- `refreshData()` pattern: Commands call `loadData()` to refresh state after mutations
- Forms use controlled components with `useState()` for all inputs
- Confirmation dialogs via `confirmAlert()` for destructive actions

## Key Files

- `src/types.ts`: TypeScript interfaces for WorkEntry, Payment, CleanerData
- `src/utils.ts`: Business logic (payment calculations, time parsing, formatting)
- `src/storage.ts`: File I/O operations (load/save to JSON)
- `src/index.tsx`: Main UI with List, AddHoursForm, MakePaymentForm components
- `src/quick-add.ts`: CLI-style quick entry command
- `src/status.ts`: HUD status display command

## Constants

- `HOURLY_RATE = 15` (€15/hour) - defined in `utils.ts`
- `ROUNDING_AMOUNT = 5` (€5 rounding) - defined in `utils.ts`

## TypeScript Configuration

- Target: ES2023
- JSX: react-jsx (Raycast uses React)
- Strict mode enabled
- Module: CommonJS (required by Raycast)