import { showHUD } from "@raycast/api";
import { BV_SERVICES } from "./config";
import { startAllServices } from "./utils";

export default async function Command() {
  try {
    await showHUD("Starting all BV services...");
    await startAllServices(BV_SERVICES);
    await showHUD("✓ All services started successfully");
  } catch (error) {
    await showHUD(`✗ Failed to start services: ${error instanceof Error ? error.message : String(error)}`);
  }
}
