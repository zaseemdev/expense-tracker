import { Routes, Route, useNavigate } from "react-router";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { AddExpenseForm } from "./AddExpenseForm";
import { HomeScreen } from "./HomeScreen";

export function AuthenticatedShell({
  roomName,
  inviteCode,
  onSignOut,
}: {
  roomName: string;
  inviteCode: string;
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
          <HomeScreen
            roomName={roomName}
            inviteCode={inviteCode}
            onSignOut={onSignOut}
            onAddExpense={() => navigate("/expenses/add")}
          />
        }
      />
    </Routes>
  );
}
