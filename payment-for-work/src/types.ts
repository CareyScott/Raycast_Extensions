export interface WorkEntry {
  id: string;
  date: string;
  startTime?: string; // HH:mm format
  endTime?: string; // HH:mm format
  hoursWorked: number;
  amountEarned: number; // hours * 15
  notes?: string;
}

export interface Payment {
  id: string;
  date: string;
  amountPaid: number;
  notes?: string;
}

export interface CleanerData {
  workEntries: WorkEntry[];
  payments: Payment[];
  currentRemainder: number; // Running total of unpaid amount
}

export interface PaymentCalculation {
  totalOwed: number; // Total amount including remainder
  suggestedPayment: number; // Rounded to nearest €5
  newRemainder: number; // What will be left over
}