import { CleanerData, PaymentCalculation } from "./types";

export const HOURLY_RATE = 15; // €15 per hour
export const ROUNDING_AMOUNT = 5; // Round to €5

/**
 * Calculate total unpaid amount (earned but not paid)
 */
export function calculateUnpaidAmount(data: CleanerData): number {
  const totalEarned = data.workEntries.reduce((sum, entry) => sum + entry.amountEarned, 0);
  const totalPaid = data.payments.reduce((sum, payment) => sum + payment.amountPaid, 0);
  return totalEarned - totalPaid;
}

/**
 * Calculate suggested payment rounded to nearest €5
 * Rounds DOWN to nearest €5, remainder rolls over to next week
 */
export function calculatePayment(totalOwed: number): PaymentCalculation {
  const suggestedPayment = Math.floor(totalOwed / ROUNDING_AMOUNT) * ROUNDING_AMOUNT;
  const newRemainder = totalOwed - suggestedPayment;

  return {
    totalOwed,
    suggestedPayment,
    newRemainder,
  };
}

/**
 * Round to nearest €5 (for custom payment amounts)
 */
export function roundToNearest5(amount: number): number {
  return Math.round(amount / ROUNDING_AMOUNT) * ROUNDING_AMOUNT;
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number): string {
  return `€${amount.toFixed(2)}`;
}

/**
 * Generate unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Calculate hours from start and end time strings (HH:mm format)
 */
export function calculateHoursFromTimes(startTime: string, endTime: string): number | null {
  if (!startTime || !endTime) return null;

  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);

  if (
    isNaN(startHour) ||
    isNaN(startMin) ||
    isNaN(endHour) ||
    isNaN(endMin) ||
    startHour < 0 ||
    startHour > 23 ||
    endHour < 0 ||
    endHour > 23 ||
    startMin < 0 ||
    startMin > 59 ||
    endMin < 0 ||
    endMin > 59
  ) {
    return null;
  }

  const startMinutes = startHour * 60 + startMin;
  let endMinutes = endHour * 60 + endMin;

  // Handle overnight shifts
  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60;
  }

  const totalMinutes = endMinutes - startMinutes;
  return Number((totalMinutes / 60).toFixed(2));
}

/**
 * Format time for display
 */
export function formatTime(time: string): string {
  return time;
}
