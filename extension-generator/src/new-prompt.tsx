/**
 * New Prompt Form
 * Form for creating new extension generation prompts
 */

import { Action, ActionPanel, Alert, confirmAlert, Form, Icon, showToast, Toast, useNavigation } from "@raycast/api";
import { useState } from "react";
import { addPrompt, updatePrompt } from "./storage";
import { GenerationPrompt, GenerationProgress } from "./types";
import { generateId } from "./utils";
import { generateExtension } from "./generator";

interface NewPromptFormProps {
  initialPrompt?: string;
  onComplete: () => void;
}

export function NewPromptForm({ initialPrompt = "", onComplete }: NewPromptFormProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [isGenerating, setIsGenerating] = useState(false);
  const { pop } = useNavigation();

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Prompt is required",
        message: "Please enter a description of the extension you want to generate",
      });
      return;
    }

    // Create prompt record
    const generationPrompt: GenerationPrompt = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      prompt: prompt.trim(),
      status: "generating",
      continueCount: 0,
    };

    try {
      // Save prompt to history
      addPrompt(generationPrompt);

      setIsGenerating(true);

      const startTime = Date.now();
      let continueCount = 0;

      // Show toast for generation start
      await showToast({
        style: Toast.Style.Animated,
        title: "Generating extension...",
        message: "This may take several minutes",
      });

      // Generate extension with progress tracking
      const result = await generateExtension(prompt.trim(), {
        onProgress: (progress: GenerationProgress) => {
          console.log(`[${progress.stage}] ${progress.message} (${progress.percentage}%)`);
          // Update toast with progress
          showToast({
            style: Toast.Style.Animated,
            title: progress.message,
            message: `${progress.percentage}% complete`,
          });
        },
        onTimeout: async () => {
          // After 10 minutes, ask user if they want to continue
          const shouldContinue = await confirmAlert({
            title: "Generation Taking Long",
            message: "Extension generation has been running for over 10 minutes. Do you want to continue?",
            primaryAction: {
              title: "Continue",
              style: Alert.ActionStyle.Default,
            },
            dismissAction: {
              title: "Cancel",
              style: Alert.ActionStyle.Cancel,
            },
          });

          if (shouldContinue) {
            continueCount++;
            updatePrompt(generationPrompt.id, { continueCount });
          }

          return shouldContinue;
        },
      });

      const duration = Date.now() - startTime;

      // Update prompt with success
      updatePrompt(generationPrompt.id, {
        status: "completed",
        result,
        duration,
        continueCount,
      });

      await showToast({
        style: Toast.Style.Success,
        title: "Extension generated!",
        message: `Created ${result.name} in ${Math.round(duration / 1000)}s`,
      });

      onComplete();
      pop();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Update prompt with failure
      updatePrompt(generationPrompt.id, {
        status: errorMessage.includes("cancelled") ? "cancelled" : "failed",
        error: errorMessage,
        duration: Date.now() - new Date(generationPrompt.timestamp).getTime(),
      });

      await showToast({
        style: Toast.Style.Failure,
        title: "Generation failed",
        message: errorMessage,
      });

      onComplete();
      setIsGenerating(false);
    }
  };

  return (
    <Form
      isLoading={isGenerating}
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Generate Extension"
            icon={Icon.Rocket}
            onSubmit={handleSubmit}
            isDisabled={isGenerating}
          />
          <Action.OpenInBrowser
            title="Open Claude Code Docs"
            url="https://docs.claude.com/code"
            icon={Icon.Book}
            shortcut={{ modifiers: ["cmd"], key: "h" }}
          />
        </ActionPanel>
      }
    >
      <Form.Description
        title="Extension Generator"
        text="Describe the Raycast extension you want to generate. Be specific about features, commands, and functionality."
      />

      <Form.TextArea
        id="prompt"
        title="Extension Description"
        placeholder="e.g., Create an extension called 'GitHub Stars' that lets me view and search my starred GitHub repositories..."
        value={prompt}
        onChange={setPrompt}
        enableMarkdown={false}
        autoFocus
      />

      <Form.Separator />

      <Form.Description text="💡 Tips for better results:" />
      <Form.Description text="• Specify the extension name explicitly" />
      <Form.Description text="• Describe the main commands and their functionality" />
      <Form.Description text="• Mention any specific APIs or services to integrate" />
      <Form.Description text="• Include details about UI preferences (List, Form, Detail, etc.)" />
      <Form.Description text="• Reference existing extensions in this project for patterns" />

      <Form.Separator />

      <Form.Description
        text="⚠️ Generation can take 5-10 minutes. You'll be prompted if it exceeds 10 minutes."
      />
    </Form>
  );
}
