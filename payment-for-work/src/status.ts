import { showHUD } from "@raycast/api";
import { loadData } from "./storage";
import { calculateUnpaidAmount, calculatePayment, formatCurrency } from "./utils";

export default async function Command() {
  try {
    const data = loadData();
    const unpaidAmount = calculateUnpaidAmount(data);
    const paymentCalc = calculatePayment(unpaidAmount);

    const totalHours = data.workEntries.reduce((sum, entry) => sum + entry.hoursWorked, 0);
    const totalPaid = data.payments.reduce((sum, payment) => sum + payment.amountPaid, 0);

    let statusMessage = `💰 Cleaner Payment Status\n\n`;
    statusMessage += `Total Hours: ${totalHours.toFixed(1)}h\n`;
    statusMessage += `Total Paid: ${formatCurrency(totalPaid)}\n`;
    statusMessage += `Unpaid Amount: ${formatCurrency(unpaidAmount)}\n\n`;

    if (paymentCalc.suggestedPayment > 0) {
      statusMessage += `💡 Suggested Payment: ${formatCurrency(paymentCalc.suggestedPayment)}\n`;
      statusMessage += `   Remainder: ${formatCurrency(paymentCalc.newRemainder)}`;
    } else {
      statusMessage += `⏳ Accumulating... (${formatCurrency(unpaidAmount)} < €5)`;
    }

    await showHUD(statusMessage);
  } catch (error) {
    await showHUD("❌ Error loading payment status");
    console.error(error);
  }
}
