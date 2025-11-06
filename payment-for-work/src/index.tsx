import { ActionPanel, Action, List, Icon, Color, useNavigation, Form, showToast, Toast, confirmAlert, Alert } from "@raycast/api";
import { useState, useEffect } from "react";
import { loadData, saveData } from "./storage";
import { CleanerData, WorkEntry, Payment } from "./types";
import {
  calculateUnpaidAmount,
  calculatePayment,
  formatCurrency,
  formatDate,
  generateId,
  HOURLY_RATE,
  roundToNearest5,
  calculateHoursFromTimes,
} from "./utils";

export default function Command() {
  const [data, setData] = useState<CleanerData>(loadData());
  const [isLoading, setIsLoading] = useState(false);

  const refreshData = () => {
    setData(loadData());
  };

  const unpaidAmount = calculateUnpaidAmount(data);
  const paymentCalc = calculatePayment(unpaidAmount);

  return (
    <List isLoading={isLoading}>
      <List.Section title="Current Status">
        <List.Item
          title="Total Unpaid"
          subtitle={formatCurrency(unpaidAmount)}
          accessories={[
            {
              tag: {
                value: unpaidAmount >= 5 ? "Ready to Pay" : "Accumulating",
                color: unpaidAmount >= 5 ? Color.Green : Color.Orange,
              },
            },
          ]}
          icon={{ source: Icon.BankNote, tintColor: Color.Blue }}
          actions={
            <ActionPanel>
              <Action.Push
                title="Make Payment"
                icon={Icon.Wallet}
                target={<MakePaymentForm data={data} onComplete={refreshData} suggestedAmount={paymentCalc.suggestedPayment} />}
              />
              <Action.Push
                title="Add Hours Worked"
                icon={Icon.Clock}
                target={<AddHoursForm data={data} onComplete={refreshData} />}
                shortcut={{ modifiers: ["cmd"], key: "n" }}
              />
            </ActionPanel>
          }
        />
        {paymentCalc.suggestedPayment > 0 && (
          <List.Item
            title="Suggested Payment"
            subtitle={formatCurrency(paymentCalc.suggestedPayment)}
            accessories={[{ text: `Remainder: ${formatCurrency(paymentCalc.newRemainder)}` }]}
            icon={{ source: Icon.Coins, tintColor: Color.Green }}
          />
        )}
      </List.Section>

      <List.Section title={`Recent Work (${data.workEntries.length} entries)`}>
        {data.workEntries
          .slice()
          .reverse()
          .slice(0, 10)
          .map((entry) => {
            const timeInfo = entry.startTime && entry.endTime ? `${entry.startTime} - ${entry.endTime}` : null;
            const subtitle = timeInfo ? `${timeInfo}${entry.notes ? " • " + entry.notes : ""}` : entry.notes || "";

            return (
              <List.Item
                key={entry.id}
                title={`${entry.hoursWorked} hours`}
                subtitle={subtitle}
                accessories={[
                  { text: formatDate(entry.date) },
                  { tag: { value: formatCurrency(entry.amountEarned), color: Color.Blue } },
                ]}
                icon={{ source: Icon.Clock, tintColor: Color.Blue }}
                actions={
                  <ActionPanel>
                    <Action.Push
                      title="Add Hours Worked"
                      icon={Icon.Clock}
                      target={<AddHoursForm data={data} onComplete={refreshData} />}
                    />
                    <Action
                      title="Delete Entry"
                      icon={Icon.Trash}
                      style={Action.Style.Destructive}
                      onAction={async () => {
                        if (
                          await confirmAlert({
                            title: "Delete Work Entry",
                            message: "Are you sure you want to delete this work entry?",
                            primaryAction: { title: "Delete", style: Alert.ActionStyle.Destructive },
                          })
                        ) {
                          const updatedData = {
                            ...data,
                            workEntries: data.workEntries.filter((e) => e.id !== entry.id),
                          };
                          saveData(updatedData);
                          refreshData();
                          showToast(Toast.Style.Success, "Work entry deleted");
                        }
                      }}
                      shortcut={{ modifiers: ["cmd"], key: "delete" }}
                    />
                  </ActionPanel>
                }
              />
            );
          })}
      </List.Section>

      <List.Section title={`Payment History (${data.payments.length} payments)`}>
        {data.payments
          .slice()
          .reverse()
          .slice(0, 10)
          .map((payment) => (
            <List.Item
              key={payment.id}
              title={formatCurrency(payment.amountPaid)}
              subtitle={payment.notes || ""}
              accessories={[{ text: formatDate(payment.date) }]}
              icon={{ source: Icon.Wallet, tintColor: Color.Green }}
              actions={
                <ActionPanel>
                  <Action.Push
                    title="Make Payment"
                    icon={Icon.Wallet}
                    target={<MakePaymentForm data={data} onComplete={refreshData} suggestedAmount={paymentCalc.suggestedPayment} />}
                  />
                  <Action
                    title="Delete Payment"
                    icon={Icon.Trash}
                    style={Action.Style.Destructive}
                    onAction={async () => {
                      if (
                        await confirmAlert({
                          title: "Delete Payment",
                          message: "Are you sure you want to delete this payment record?",
                          primaryAction: { title: "Delete", style: Alert.ActionStyle.Destructive },
                        })
                      ) {
                        const updatedData = {
                          ...data,
                          payments: data.payments.filter((p) => p.id !== payment.id),
                        };
                        saveData(updatedData);
                        refreshData();
                        showToast(Toast.Style.Success, "Payment deleted");
                      }
                    }}
                    shortcut={{ modifiers: ["cmd"], key: "delete" }}
                  />
                </ActionPanel>
              }
            />
          ))}
      </List.Section>
    </List>
  );
}

// Form to add hours worked
function AddHoursForm({ data, onComplete }: { data: CleanerData; onComplete: () => void }) {
  const { pop } = useNavigation();
  const [date, setDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [hours, setHours] = useState("");
  const [notes, setNotes] = useState("");

  // Calculate hours from times if both are provided
  const calculatedHours = startTime && endTime ? calculateHoursFromTimes(startTime, endTime) : null;
  const finalHours = calculatedHours !== null ? calculatedHours : parseFloat(hours) || 0;

  const handleSubmit = async () => {
    let hoursNum: number;

    if (startTime && endTime) {
      const calculated = calculateHoursFromTimes(startTime, endTime);
      if (calculated === null || calculated <= 0) {
        showToast(Toast.Style.Failure, "Invalid times", "Please enter valid start and end times");
        return;
      }
      hoursNum = calculated;
    } else {
      hoursNum = parseFloat(hours);
      if (isNaN(hoursNum) || hoursNum <= 0) {
        showToast(Toast.Style.Failure, "Invalid hours", "Please enter hours or start/end times");
        return;
      }
    }

    const newEntry: WorkEntry = {
      id: generateId(),
      date: date.toISOString(),
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      hoursWorked: hoursNum,
      amountEarned: hoursNum * HOURLY_RATE,
      notes: notes.trim() || undefined,
    };

    const updatedData = {
      ...data,
      workEntries: [...data.workEntries, newEntry],
    };

    saveData(updatedData);
    await showToast(Toast.Style.Success, "Hours added", `${hoursNum} hours (${formatCurrency(newEntry.amountEarned)})`);
    onComplete();
    pop();
  };

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Add Hours" icon={Icon.Check} onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.DatePicker id="date" title="Date" value={date} onChange={(newDate) => newDate && setDate(newDate)} />
      <Form.Separator />
      <Form.TextField
        id="startTime"
        title="Start Time (optional)"
        placeholder="09:00"
        value={startTime}
        onChange={setStartTime}
        info="Format: HH:mm (e.g., 09:00)"
      />
      <Form.TextField
        id="endTime"
        title="End Time (optional)"
        placeholder="12:30"
        value={endTime}
        onChange={setEndTime}
        info="Format: HH:mm (e.g., 12:30)"
      />
      {calculatedHours !== null && calculatedHours > 0 && (
        <Form.Description text={`Calculated: ${calculatedHours} hours from times`} />
      )}
      <Form.Separator />
      <Form.TextField
        id="hours"
        title="Hours Worked (or use times above)"
        placeholder="3.5"
        value={hours}
        onChange={setHours}
        info={`Rate: €${HOURLY_RATE}/hour`}
      />
      <Form.TextArea id="notes" title="Notes (optional)" placeholder="e.g., Deep clean, extra tasks..." value={notes} onChange={setNotes} />
      {finalHours > 0 && <Form.Description text={`Amount to earn: ${formatCurrency(finalHours * HOURLY_RATE)}`} />}
    </Form>
  );
}

// Form to make a payment
function MakePaymentForm({
  data,
  onComplete,
  suggestedAmount,
}: {
  data: CleanerData;
  onComplete: () => void;
  suggestedAmount: number;
}) {
  const { pop } = useNavigation();
  const unpaidAmount = calculateUnpaidAmount(data);
  const [amount, setAmount] = useState(suggestedAmount > 0 ? suggestedAmount.toString() : "");
  const [notes, setNotes] = useState("");

  const handleSubmit = async () => {
    const amountNum = parseFloat(amount);

    if (isNaN(amountNum) || amountNum <= 0) {
      showToast(Toast.Style.Failure, "Invalid amount", "Please enter a valid payment amount");
      return;
    }

    if (amountNum > unpaidAmount) {
      const confirmed = await confirmAlert({
        title: "Overpayment Warning",
        message: `You're paying ${formatCurrency(amountNum)} but only ${formatCurrency(unpaidAmount)} is owed. Continue?`,
        primaryAction: { title: "Pay Anyway" },
      });

      if (!confirmed) return;
    }

    const newPayment: Payment = {
      id: generateId(),
      date: new Date().toISOString(),
      amountPaid: amountNum,
      notes: notes.trim() || undefined,
    };

    const updatedData = {
      ...data,
      payments: [...data.payments, newPayment],
    };

    saveData(updatedData);

    const newUnpaid = unpaidAmount - amountNum;
    await showToast(
      Toast.Style.Success,
      "Payment recorded",
      `Paid ${formatCurrency(amountNum)}. Remaining: ${formatCurrency(newUnpaid)}`
    );
    onComplete();
    pop();
  };

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Record Payment" icon={Icon.Check} onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.Description
        title="Total Owed"
        text={formatCurrency(unpaidAmount)}
      />
      <Form.TextField
        id="amount"
        title="Payment Amount"
        placeholder={suggestedAmount > 0 ? suggestedAmount.toString() : "0"}
        value={amount}
        onChange={setAmount}
        info="Suggested: rounded to nearest €5"
      />
      {suggestedAmount > 0 && (
        <Form.Description text={`Suggested payment: ${formatCurrency(suggestedAmount)} (Remainder: ${formatCurrency(unpaidAmount - suggestedAmount)})`} />
      )}
      <Form.TextArea id="notes" title="Notes (optional)" placeholder="e.g., Cash payment, bank transfer..." value={notes} onChange={setNotes} />
      <Form.Separator />
      <Form.Description text="💡 Tip: Round to €5 to keep remainder for next week" />
    </Form>
  );
}