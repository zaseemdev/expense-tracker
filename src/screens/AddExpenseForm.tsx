import { useState } from "react";

export function AddExpenseForm({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (data: { amount: number; date: string; description: string }) => void;
}) {
  const today = new Date().toISOString().split("T")[0];
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  return (
    <div>
      <h1>Add Expense</h1>
      <button onClick={onClose} aria-label="×">×</button>
      <form onSubmit={(e) => {
        e.preventDefault();
        const date = new FormData(e.currentTarget).get("date") as string;
        onSave({ amount: Number(amount), date, description });
      }}>
        <label htmlFor="date">Date</label>
        <input id="date" name="date" type="date" defaultValue={today} />
        <label htmlFor="amount">Amount</label>
        <input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <label htmlFor="description">Description</label>
        <input id="description" type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
        <button type="submit" disabled={!description.trim() || Number(amount) <= 0}>Save</button>
      </form>
    </div>
  );
}
