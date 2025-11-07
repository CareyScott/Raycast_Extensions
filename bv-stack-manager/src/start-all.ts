import { showHUD } from "@raycast/api";
import { BV_SERVICES } from "./config";
import { startAllServices, getAllServiceStatuses } from "./utils";

export default async function Command() {
  try {
    await showHUD("Starting all BV services...");

    const beforeStatuses = await getAllServiceStatuses(BV_SERVICES);
    const alreadyRunning = beforeStatuses.filter((s) => s.running).length;

    await startAllServices(BV_SERVICES);

    const afterStatuses = await getAllServiceStatuses(BV_SERVICES);
    const nowRunning = afterStatuses.filter((s) => s.running).length;

    if (alreadyRunning > 0) {
      await showHUD(`✓ Services started (${alreadyRunning} already running) - ${nowRunning}/${BV_SERVICES.length} running`);
    } else {
      await showHUD(`✓ All services started - ${nowRunning}/${BV_SERVICES.length} running`);
    }
  } catch (error) {
    await showHUD(`✗ Failed to start services: ${error instanceof Error ? error.message : String(error)}`);
  }
}
