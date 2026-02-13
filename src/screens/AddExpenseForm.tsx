import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export function AddExpenseForm({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (data: {
    amount: number;
    date: string;
    description: string;
    splits: Array<{ userId: Id<"users">; amount: number }>;
  }) => void;
}) {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const members = useQuery(api.rooms.getRoomMembers) ?? [];
  const currentUserId = useQuery(api.users.getCurrentUserId);
  const [unchecked, setUnchecked] = useState<Set<Id<"users">>>(new Set());

  function handleSubmit() {
    const total = Number(amount);
    const checkedMembers = members.filter((m) => !unchecked.has(m.userId));
    const splitCount = checkedMembers.length;
    const splits = checkedMembers.map((m) => ({
      userId: m.userId,
      amount: Number((total / splitCount).toFixed(2)),
    }));
    onSave({ amount: total, date, description, splits });
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="flex items-center justify-between p-4 border-b border-zinc-800">
        <h1 className="text-lg font-bold">Add Expense</h1>
        <button
          onClick={onClose}
          aria-label="×"
          className="text-zinc-400 text-xl hover:text-white transition-colors"
        >
          ×
        </button>
      </header>
      <form
        className="p-4 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <div className="space-y-1">
          <label htmlFor="date" className="block text-sm text-zinc-400">
            Date
          </label>
          <input
            id="date"
            name="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-white"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="amount" className="block text-sm text-zinc-400">
            Amount
          </label>
          <input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-white"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="description" className="block text-sm text-zinc-400">
            Description
          </label>
          <input
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What was this expense for?"
            className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-white"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">Split with</span>
            <button
              type="button"
              className="text-sm text-green-400"
              onClick={() => {
                if (unchecked.size === 0) {
                  setUnchecked(new Set(members.map((m) => m.userId)));
                } else {
                  setUnchecked(new Set());
                }
              }}
            >
              {unchecked.size === 0 ? "Unselect All" : "Select All"}
            </button>
          </div>
          <div className="rounded-lg border border-zinc-800 divide-y divide-zinc-800">
            {members.map((m) => (
              <label
                key={m.userId}
                className="flex items-center justify-between px-3 py-3 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={!unchecked.has(m.userId)}
                    onChange={() =>
                      setUnchecked((prev) => {
                        const next = new Set(prev);
                        if (next.has(m.userId)) next.delete(m.userId);
                        else next.add(m.userId);
                        return next;
                      })
                    }
                    className="accent-green-500"
                  />
                  <span>{m.displayName}</span>
                  {m.userId === currentUserId && (
                    <span className="text-xs text-zinc-400">You</span>
                  )}
                </div>
                {Number(amount) > 0 &&
                  !unchecked.has(m.userId) &&
                  members.length - unchecked.size > 0 && (
                    <span className="text-sm text-zinc-400">
                      ₹
                      {(
                        Number(amount) /
                        (members.length - unchecked.size)
                      ).toFixed(2)}
                    </span>
                  )}
              </label>
            ))}
          </div>
        </div>
        <button
          type="submit"
          disabled={
            !description.trim() ||
            Number(amount) <= 0 ||
            unchecked.size >= members.length
          }
          className="w-full rounded-lg bg-green-500 py-3 font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-green-600 transition-colors"
        >
          Save
        </button>
      </form>
    </div>
  );
}
