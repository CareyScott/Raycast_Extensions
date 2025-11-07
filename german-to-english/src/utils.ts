import { FinTechTerm, TranslationResult, TranslationOptions } from "./types";

/**
 * Comprehensive FinTech terminology database
 */
export const FINTECH_TERMS: FinTechTerm[] = [
  // Payment terms
  {
    english: "payment",
    german: "Zahlung",
    alternatives: ["Bezahlung"],
    category: "payment",
  },
  {
    english: "pay",
    german: "bezahlen",
    alternatives: ["zahlen"],
    category: "payment",
  },
  {
    english: "transfer",
    german: "Überweisung",
    alternatives: ["Transfer"],
    category: "payment",
  },
  {
    english: "send money",
    german: "Geld senden",
    alternatives: ["Geld überweisen"],
    category: "payment",
  },
  {
    english: "receive money",
    german: "Geld empfangen",
    alternatives: ["Geld erhalten"],
    category: "payment",
  },
  {
    english: "transaction",
    german: "Transaktion",
    alternatives: ["Vorgang"],
    category: "transaction",
  },
  {
    english: "refund",
    german: "Rückerstattung",
    alternatives: ["Erstattung"],
    category: "payment",
  },
  {
    english: "charge",
    german: "Gebühr",
    alternatives: ["Kosten"],
    category: "payment",
  },
  {
    english: "fee",
    german: "Gebühr",
    alternatives: ["Kosten"],
    category: "payment",
  },
  {
    english: "invoice",
    german: "Rechnung",
    alternatives: ["Faktura"],
    category: "payment",
  },
  {
    english: "receipt",
    german: "Quittung",
    alternatives: ["Beleg"],
    category: "payment",
  },
  {
    english: "deposit",
    german: "Einzahlung",
    alternatives: ["Hinterlegung"],
    category: "payment",
  },
  {
    english: "withdrawal",
    german: "Auszahlung",
    alternatives: ["Abhebung"],
    category: "payment",
  },

  // Account terms
  {
    english: "account",
    german: "Konto",
    alternatives: ["Account"],
    category: "account",
  },
  {
    english: "balance",
    german: "Kontostand",
    alternatives: ["Saldo", "Guthaben"],
    category: "account",
  },
  {
    english: "bank account",
    german: "Bankkonto",
    alternatives: ["Girokonto"],
    category: "account",
  },
  {
    english: "account number",
    german: "Kontonummer",
    alternatives: ["IBAN"],
    category: "account",
  },
  {
    english: "account holder",
    german: "Kontoinhaber",
    alternatives: ["Inhaber"],
    category: "account",
  },
  {
    english: "statement",
    german: "Kontoauszug",
    alternatives: ["Abrechnung"],
    category: "account",
  },
  {
    english: "profile",
    german: "Profil",
    alternatives: ["Benutzerprofil"],
    category: "account",
  },
  {
    english: "settings",
    german: "Einstellungen",
    alternatives: ["Konfiguration"],
    category: "account",
  },

  // Transaction terms
  {
    english: "pending",
    german: "ausstehend",
    alternatives: ["in Bearbeitung"],
    category: "transaction",
  },
  {
    english: "completed",
    german: "abgeschlossen",
    alternatives: ["erledigt"],
    category: "transaction",
  },
  {
    english: "failed",
    german: "fehlgeschlagen",
    alternatives: ["gescheitert"],
    category: "transaction",
  },
  {
    english: "cancelled",
    german: "storniert",
    alternatives: ["abgebrochen"],
    category: "transaction",
  },
  {
    english: "processing",
    german: "wird bearbeitet",
    alternatives: ["in Verarbeitung"],
    category: "transaction",
  },
  {
    english: "amount",
    german: "Betrag",
    alternatives: ["Summe"],
    category: "transaction",
  },
  {
    english: "date",
    german: "Datum",
    alternatives: ["Zeitpunkt"],
    category: "transaction",
  },
  {
    english: "recipient",
    german: "Empfänger",
    alternatives: ["Zahlungsempfänger"],
    category: "transaction",
  },
  {
    english: "sender",
    german: "Absender",
    alternatives: ["Zahler"],
    category: "transaction",
  },
  {
    english: "reference",
    german: "Verwendungszweck",
    alternatives: ["Referenz"],
    category: "transaction",
  },
  {
    english: "description",
    german: "Beschreibung",
    alternatives: ["Details"],
    category: "transaction",
  },

  // Security terms
  {
    english: "password",
    german: "Passwort",
    alternatives: ["Kennwort"],
    category: "security",
  },
  {
    english: "security",
    german: "Sicherheit",
    alternatives: ["Schutz"],
    category: "security",
  },
  {
    english: "authentication",
    german: "Authentifizierung",
    alternatives: ["Anmeldung"],
    category: "security",
  },
  {
    english: "two-factor authentication",
    german: "Zwei-Faktor-Authentifizierung",
    alternatives: ["2FA"],
    category: "security",
  },
  {
    english: "login",
    german: "Anmeldung",
    alternatives: ["Login"],
    category: "security",
  },
  {
    english: "logout",
    german: "Abmeldung",
    alternatives: ["Logout"],
    category: "security",
  },
  {
    english: "sign in",
    german: "anmelden",
    alternatives: ["einloggen"],
    category: "security",
  },
  {
    english: "sign out",
    german: "abmelden",
    alternatives: ["ausloggen"],
    category: "security",
  },
  {
    english: "sign up",
    german: "registrieren",
    alternatives: ["anmelden"],
    category: "security",
  },
  {
    english: "register",
    german: "registrieren",
    alternatives: ["anmelden"],
    category: "security",
  },
  {
    english: "verify",
    german: "verifizieren",
    alternatives: ["bestätigen"],
    category: "verification",
  },
  {
    english: "verification",
    german: "Verifizierung",
    alternatives: ["Bestätigung"],
    category: "verification",
  },
  {
    english: "verified",
    german: "verifiziert",
    alternatives: ["bestätigt"],
    category: "verification",
  },
  {
    english: "confirm",
    german: "bestätigen",
    alternatives: ["verifizieren"],
    category: "verification",
  },
  {
    english: "confirmation",
    german: "Bestätigung",
    alternatives: ["Verifizierung"],
    category: "verification",
  },

  // UI terms
  {
    english: "continue",
    german: "Weiter",
    alternatives: ["Fortfahren"],
    category: "ui",
  },
  {
    english: "cancel",
    german: "Abbrechen",
    alternatives: ["Verwerfen"],
    category: "ui",
  },
  {
    english: "submit",
    german: "Absenden",
    alternatives: ["Einreichen"],
    category: "ui",
  },
  {
    english: "save",
    german: "Speichern",
    alternatives: ["Sichern"],
    category: "ui",
  },
  {
    english: "delete",
    german: "Löschen",
    alternatives: ["Entfernen"],
    category: "ui",
  },
  {
    english: "edit",
    german: "Bearbeiten",
    alternatives: ["Ändern"],
    category: "ui",
  },
  {
    english: "back",
    german: "Zurück",
    alternatives: ["Zurück"],
    category: "ui",
  },
  {
    english: "next",
    german: "Weiter",
    alternatives: ["Nächster"],
    category: "ui",
  },
  {
    english: "previous",
    german: "Zurück",
    alternatives: ["Vorheriger"],
    category: "ui",
  },
  {
    english: "search",
    german: "Suchen",
    alternatives: ["Suche"],
    category: "ui",
  },
  {
    english: "filter",
    german: "Filtern",
    alternatives: ["Filter"],
    category: "ui",
  },
  {
    english: "sort",
    german: "Sortieren",
    alternatives: ["Ordnen"],
    category: "ui",
  },
  {
    english: "view",
    german: "Ansicht",
    alternatives: ["Anzeigen"],
    category: "ui",
  },
  {
    english: "details",
    german: "Details",
    alternatives: ["Einzelheiten"],
    category: "ui",
  },
  {
    english: "download",
    german: "Herunterladen",
    alternatives: ["Download"],
    category: "ui",
  },
  {
    english: "upload",
    german: "Hochladen",
    alternatives: ["Upload"],
    category: "ui",
  },

  // Error messages
  {
    english: "error",
    german: "Fehler",
    alternatives: ["Error"],
    category: "error",
  },
  {
    english: "invalid",
    german: "ungültig",
    alternatives: ["falsch"],
    category: "error",
  },
  {
    english: "required",
    german: "erforderlich",
    alternatives: ["notwendig", "Pflichtfeld"],
    category: "error",
  },
  {
    english: "failed",
    german: "fehlgeschlagen",
    alternatives: ["gescheitert"],
    category: "error",
  },
  {
    english: "not found",
    german: "nicht gefunden",
    alternatives: ["nicht vorhanden"],
    category: "error",
  },
  {
    english: "insufficient funds",
    german: "unzureichendes Guthaben",
    alternatives: ["nicht genug Guthaben"],
    category: "error",
  },
  {
    english: "try again",
    german: "erneut versuchen",
    alternatives: ["nochmal versuchen"],
    category: "error",
  },

  // Success messages
  {
    english: "success",
    german: "Erfolgreich",
    alternatives: ["Erfolg"],
    category: "success",
  },
  {
    english: "completed successfully",
    german: "erfolgreich abgeschlossen",
    alternatives: ["erfolgreich erledigt"],
    category: "success",
  },
  {
    english: "sent",
    german: "gesendet",
    alternatives: ["verschickt"],
    category: "success",
  },
  {
    english: "received",
    german: "empfangen",
    alternatives: ["erhalten"],
    category: "success",
  },
  {
    english: "saved",
    german: "gespeichert",
    alternatives: ["gesichert"],
    category: "success",
  },

  // General terms
  {
    english: "app",
    german: "App",
    alternatives: ["Anwendung"],
    category: "general",
  },
  {
    english: "bank",
    german: "Bank",
    alternatives: ["Geldinstitut"],
    category: "general",
  },
  {
    english: "card",
    german: "Karte",
    alternatives: ["Zahlkarte"],
    category: "general",
  },
  {
    english: "credit card",
    german: "Kreditkarte",
    alternatives: ["Karte"],
    category: "general",
  },
  {
    english: "debit card",
    german: "Debitkarte",
    alternatives: ["EC-Karte"],
    category: "general",
  },
  {
    english: "currency",
    german: "Währung",
    alternatives: ["Währung"],
    category: "general",
  },
  {
    english: "euro",
    german: "Euro",
    alternatives: ["EUR"],
    category: "general",
  },
  {
    english: "dollar",
    german: "Dollar",
    alternatives: ["USD"],
    category: "general",
  },
  {
    english: "customer",
    german: "Kunde",
    alternatives: ["Kundin"],
    category: "general",
  },
  {
    english: "support",
    german: "Support",
    alternatives: ["Unterstützung", "Hilfe"],
    category: "general",
  },
  {
    english: "help",
    german: "Hilfe",
    alternatives: ["Support"],
    category: "general",
  },
  {
    english: "contact",
    german: "Kontakt",
    alternatives: ["Kontaktieren"],
    category: "general",
  },
  {
    english: "notification",
    german: "Benachrichtigung",
    alternatives: ["Mitteilung"],
    category: "general",
  },
  {
    english: "email",
    german: "E-Mail",
    alternatives: ["E-Mail-Adresse"],
    category: "general",
  },
  {
    english: "phone",
    german: "Telefon",
    alternatives: ["Telefonnummer"],
    category: "general",
  },
  {
    english: "address",
    german: "Adresse",
    alternatives: ["Anschrift"],
    category: "general",
  },
  {
    english: "name",
    german: "Name",
    alternatives: ["Bezeichnung"],
    category: "general",
  },
];

/**
 * Search for exact or partial matches in the FinTech terms database
 */
export function findFinTechTranslation(text: string): FinTechTerm | undefined {
  const normalizedText = text.toLowerCase().trim();

  // Try exact match first
  const exactMatch = FINTECH_TERMS.find(
    (term) => term.english.toLowerCase() === normalizedText,
  );
  if (exactMatch) return exactMatch;

  // Try partial match (text contains the term)
  return FINTECH_TERMS.find((term) =>
    normalizedText.includes(term.english.toLowerCase()),
  );
}

/**
 * Get all matching terms for a given text
 */
export function findAllFinTechMatches(text: string): FinTechTerm[] {
  const normalizedText = text.toLowerCase().trim();
  return FINTECH_TERMS.filter((term) =>
    normalizedText.includes(term.english.toLowerCase()),
  );
}

/**
 * Translate English text to German
 * This is a simple implementation using the FinTech terms database
 * For production, you'd want to integrate with a proper translation API
 */
export function translateToGerman(
  text: string,
  options?: TranslationOptions,
): TranslationResult {
  const normalizedText = text.trim();

  // Check for exact match in FinTech terms
  const exactMatch = findFinTechTranslation(normalizedText);
  if (exactMatch) {
    return {
      original: text,
      translated: exactMatch.german,
      alternatives: exactMatch.alternatives,
      context: exactMatch.context,
      category: exactMatch.category,
    };
  }

  // Check for multiple terms in the text
  const matches = findAllFinTechMatches(normalizedText);
  if (matches.length > 0) {
    // Try to replace all found terms
    let translated = normalizedText;
    const usedTerms: string[] = [];

    matches.forEach((match) => {
      const regex = new RegExp(`\\b${match.english}\\b`, "gi");
      if (regex.test(translated)) {
        translated = translated.replace(regex, match.german);
        usedTerms.push(match.german);
      }
    });

    if (translated !== normalizedText) {
      return {
        original: text,
        translated: capitalizeFirstLetter(translated),
        context: `Found ${matches.length} FinTech term(s): ${usedTerms.join(", ")}`,
        category: matches[0].category,
      };
    }
  }

  // No match found - return guidance
  return {
    original: text,
    translated: "⚠️ Keine direkte Übersetzung gefunden",
    context:
      "Bitte verwenden Sie einen professionellen Übersetzungsdienst für allgemeine Texte",
    category: "general",
  };
}

/**
 * Format a translation result as markdown
 */
export function formatTranslationResult(result: TranslationResult): string {
  let markdown = `# Übersetzung\n\n`;
  markdown += `**Original:** ${result.original}\n\n`;
  markdown += `**German:** ${result.translated}\n\n`;

  if (result.alternatives && result.alternatives.length > 0) {
    markdown += `**Alternativen:** ${result.alternatives.join(", ")}\n\n`;
  }

  if (result.category) {
    markdown += `**Kategorie:** ${formatCategoryName(result.category)}\n\n`;
  }

  if (result.context) {
    markdown += `**Kontext:** ${result.context}\n\n`;
  }

  return markdown;
}

/**
 * Format category name for display
 */
export function formatCategoryName(category: string): string {
  const categoryNames: Record<string, string> = {
    payment: "Zahlung",
    account: "Konto",
    transaction: "Transaktion",
    security: "Sicherheit",
    verification: "Verifizierung",
    general: "Allgemein",
    ui: "Benutzeroberfläche",
    error: "Fehlermeldung",
    success: "Erfolgsmeldung",
  };
  return categoryNames[category] || category;
}

/**
 * Capitalize first letter of a string
 */
function capitalizeFirstLetter(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Get all terms by category
 */
export function getTermsByCategory(category: string): FinTechTerm[] {
  return FINTECH_TERMS.filter((term) => term.category === category);
}

/**
 * Get all unique categories
 */
export function getAllCategories(): string[] {
  return Array.from(new Set(FINTECH_TERMS.map((term) => term.category)));
}
