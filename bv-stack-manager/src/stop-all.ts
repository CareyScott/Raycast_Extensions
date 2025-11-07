import { showHUD } from "@raycast/api";
import { BV_SERVICES } from "./config";
import { stopAllServices } from "./utils";

export default async function Command() {
  try {
    await showHUD("Stopping all BV services...");
    await stopAllServices(BV_SERVICES);
    await showHUD("✓ All services stopped successfully");
  } catch (error) {
    await showHUD(`✗ Failed to stop services: ${error instanceof Error ? error.message : String(error)}`);
  }
}
