/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Default Language - Default language for spell checking */
  "defaultLanguage": "auto" | "en" | "es" | "fr" | "de" | "it" | "pt" | "nl" | "pl" | "ru" | "zh" | "ja" | "ko",
  /** Claude Code Path - Path to Claude Code executable (leave empty for default 'claude') */
  "claudePath": string
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `spell-check` command */
  export type SpellCheck = ExtensionPreferences & {
  /** Auto-detect Language - Automatically detect the language (recommended) */
  "useAutoLanguage": boolean
}
  /** Preferences accessible in the `spell-check-clipboard` command */
  export type SpellCheckClipboard = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `spell-check` command */
  export type SpellCheck = {}
  /** Arguments passed to the `spell-check-clipboard` command */
  export type SpellCheckClipboard = {}
}

