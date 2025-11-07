import { showHUD } from "@raycast/api";
import { BV_SERVICES } from "./config";
import { getAllServiceStatuses } from "./utils";

export default async function Command() {
  try {
    const statuses = await getAllServiceStatuses(BV_SERVICES);
    const runningServices = statuses.filter((s) => s.running);
    const stoppedServices = statuses.filter((s) => !s.running);

    const runningCount = runningServices.length;
    const totalCount = BV_SERVICES.length;

    let message = `BV Stack: ${runningCount}/${totalCount} running\n\n`;

    if (runningServices.length > 0) {
      message += "Running: " + runningServices.map((s) => s.name).join(", ");
    }

    if (stoppedServices.length > 0) {
      if (runningServices.length > 0) message += "\n";
      message += "Stopped: " + stoppedServices.map((s) => s.name).join(", ");
    }

    await showHUD(message);
  } catch (error) {
    await showHUD(`✗ Failed to get status: ${error instanceof Error ? error.message : String(error)}`);
  }
}
