import { LaunchProps, showHUD, showToast, Toast } from "@raycast/api";
import { loadData, saveData } from "./storage";
import { WorkEntry } from "./types";
import { generateId, HOURLY_RATE, formatCurrency, calculateUnpaidAmount } from "./utils";

interface QuickAddArguments {
  hours: string;
  notes?: string;
}

export default async function Command(props: LaunchProps<{ arguments: QuickAddArguments }>) {
  const { hours, notes } = props.arguments;

  try {
    const hoursNum = parseFloat(hours);

    if (isNaN(hoursNum) || hoursNum <= 0) {
      await showToast(Toast.Style.Failure, "Invalid hours", "Please provide a valid number of hours");
      return;
    }

    const data = loadData();

    const newEntry: WorkEntry = {
      id: generateId(),
      date: new Date().toISOString(),
      hoursWorked: hoursNum,
      amountEarned: hoursNum * HOURLY_RATE,
      notes: notes?.trim() || undefined,
    };

    const updatedData = {
      ...data,
      workEntries: [...data.workEntries, newEntry],
    };

    saveData(updatedData);

    const totalUnpaid = calculateUnpaidAmount(updatedData);

    await showHUD(
      `✅ Added ${hoursNum}h (${formatCurrency(newEntry.amountEarned)})\nTotal unpaid: ${formatCurrency(totalUnpaid)}`
    );
  } catch (error) {
    await showToast(Toast.Style.Failure, "Error", "Failed to add hours");
    console.error(error);
  }
}