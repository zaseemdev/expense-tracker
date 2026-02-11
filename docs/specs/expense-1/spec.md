# EXPENSE-1: Add Expense (Date, Amount, Description)

## Context

Users who are members of a room can add expenses. The payer is always the current user. This slice covers creating an expense only. Splitting logic (SPLIT-1) and expense list display (HISTORY-1) are separate slices.

## Requirements

### EXPENSE-1.1: AuthenticatedShell shows room name and FAB

- The header shows the room name (e.g. "Flat 42 Expenses") and sign-out button
- A green floating action button (FAB) with "+" is fixed at the bottom-right corner

### EXPENSE-1.2: Add expense form

- Tapping the "+" FAB navigates to a full-screen "Add Expense" form
- Field order (matching mockup): "Date" (date input, defaults to today), "Amount" (number input), "Description" (text input)
- "Save" submit button at the bottom
- Close button (×) in the header to return to the shell

### EXPENSE-1.3: Save button disabled when required fields empty

- Save button is disabled until description has at least one non-whitespace character AND amount is greater than 0

### EXPENSE-1.4: Creating an expense persists to database

- Submitting the form calls a `createExpense` mutation
- An expense document is created with roomId, paidBy (current user), amount, date, description, and createdAt
- After creation, the form closes and returns to the shell

### EXPENSE-1.5: Backend guard — unauthenticated createExpense throws

- Calling createExpense without authentication throws "Not authenticated"

### EXPENSE-1.6: Backend guard — non-member cannot create expense

- A user who is not a member of the specified room cannot create an expense (throws "Not a room member")

## Out of Scope

- Splitting expenses among roommates (SPLIT-1)
- "+ Add Another" sequential entry flow (EXPENSE-2)
- Editing expenses (EXPENSE-3)
- Expense list / history display (HISTORY-1)
- Balances/History tabs (BALANCE-1, HISTORY-1)
- Currency selection / formatting locale

## Tech Notes

- Schema: Add `expenses` table (roomId, paidBy, amount, date, description, createdAt), indexed by roomId
- Backend: New `convex/expenses.ts` with `createExpense` mutation
- Amount stored as number (float — e.g. 450 for ₹450)
- Date stored as string (ISO date, e.g. "2026-02-11")
- Frontend: Update `AuthenticatedShell` to show room name + green "+" FAB
- New screen component `AddExpenseForm` in `src/screens/`
- FAB: fixed position, bottom-right, green circle with "+" icon
