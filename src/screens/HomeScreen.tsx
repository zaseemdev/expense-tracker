import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function HomeScreen({
  roomName,
  inviteCode,
  onSignOut,
  onAddExpense,
}: {
  roomName: string;
  inviteCode: string;
  onSignOut: () => void;
  onAddExpense: () => void;
}) {
  const expenses = useQuery(api.expenses.getExpenses) ?? [];

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="flex items-center justify-between p-4 border-b border-zinc-800">
        <h1 className="text-lg font-bold">{roomName} Expenses</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => void navigator.clipboard.writeText(inviteCode)}
            className="text-zinc-400 text-sm hover:text-white transition-colors"
            aria-label="Copy invite code"
          >
            Copy Invite
          </button>
          <button
            onClick={onSignOut}
            className="text-zinc-400 text-sm hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>
      <main className="p-4">
        {expenses.length === 0 ? (
          <p className="text-zinc-400 text-center py-8">No expenses yet</p>
        ) : (
          <ul className="space-y-3">
            {expenses.map((expense) => (
              <li
                key={expense._id}
                className="rounded-lg bg-zinc-900 border border-zinc-800 p-3"
              >
                <div className="flex justify-between items-start">
                  <span className="font-medium">{expense.description}</span>
                  <span>₹{expense.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mt-1 text-sm text-zinc-400">
                  <span>
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-zinc-700 text-xs text-white mr-2">
                      {expense.paidBy.displayName.charAt(0)}
                    </span>
                    {expense.paidBy.displayName} paid
                  </span>
                  {expense.myShare != null && (
                    <span className="text-green-400">
                      Your share: ₹{expense.myShare.toLocaleString()}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
        <button
          onClick={onAddExpense}
          className="fixed bottom-6 right-6 w-14 h-14 bg-green-500 rounded-full text-white text-2xl shadow-lg"
          aria-label="+"
        >
          +
        </button>
      </main>
    </div>
  );
}
