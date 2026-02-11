import { Routes, Route, useNavigate } from "react-router";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { AddExpenseForm } from "./AddExpenseForm";

export function AuthenticatedShell({
  roomName,
  onSignOut,
}: {
  roomName: string;
  onSignOut: () => void;
}) {
  const navigate = useNavigate();
  const createExpense = useMutation(api.expenses.createExpense);

  return (
    <Routes>
      <Route
        path="expenses/add"
        element={
          <AddExpenseForm
            onClose={() => navigate("/")}
            onSave={async (data) => {
              await createExpense(data);
              navigate("/");
            }}
          />
        }
      />
      <Route
        path="*"
        element={
          <div className="min-h-screen bg-zinc-950 text-white">
            <header className="flex items-center justify-between p-4 border-b border-zinc-800">
              <h1 className="text-lg font-bold">{roomName} Expenses</h1>
              <button
                onClick={onSignOut}
                className="text-zinc-400 text-sm hover:text-white transition-colors"
              >
                Sign out
              </button>
            </header>
            <main className="p-4">
              <button
                onClick={() => navigate("/expenses/add")}
                className="fixed bottom-6 right-6 w-14 h-14 bg-green-500 rounded-full text-white text-2xl shadow-lg"
                aria-label="+"
              >
                +
              </button>
            </main>
          </div>
        }
      />
    </Routes>
  );
}
