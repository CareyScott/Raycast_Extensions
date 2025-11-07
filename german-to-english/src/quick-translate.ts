import { Clipboard, showHUD, showToast, Toast } from "@raycast/api";
import { translateToGerman } from "./utils";

export default async function Command() {
  try {
    // Show initial toast
    const toast = await showToast({
      style: Toast.Style.Animated,
      title: "Reading clipboard...",
    });

    // Read text from clipboard
    const clipboardText = await Clipboard.readText();

    if (!clipboardText || !clipboardText.trim()) {
      await toast.hide();
      await showHUD("⚠️ Clipboard is empty");
      return;
    }

    // Update toast
    toast.title = "Translating...";
    toast.message = "Processing text";

    // Translate the text
    const result = translateToGerman(clipboardText.trim());

    // Copy the translation back to clipboard
    await Clipboard.copy(result.translated);

    // Hide toast and show HUD
    await toast.hide();

    if (result.translated.startsWith("⚠️")) {
      await showHUD(
        `⚠️ No FinTech translation found for: "${clipboardText.substring(0, 30)}..."`,
      );
    } else {
      await showHUD(`✓ Translated and copied: "${result.translated}"`);
    }
  } catch (error) {
    await showToast(
      Toast.Style.Failure,
      "Translation failed",
      error instanceof Error ? error.message : "Unknown error",
    );
  }
}
