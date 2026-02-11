# SPLIT-1: Select Roommates to Split With

## Context

When adding an expense, the user selects which room members to split the cost with. The payer (current user) is selected by default but can uncheck themselves (e.g., buying only for others). The split is equal among selected members. This extends the existing AddExpenseForm (EXPENSE-1).

## Requirements

### SPLIT-1.1: Add expenseSplits table to schema

- New `expenseSplits` table: expenseId (id ref to expenses), userId (id ref to users), amount (number)
- Indexed by expenseId for querying all splits of an expense

### SPLIT-1.2: Query to get room members with display names

- New `getRoomMembers` query in `convex/rooms.ts`
- Returns list of `{ userId, displayName }` for all members of the current user's room
- Returns empty array if user is not in a room or not authenticated

### SPLIT-1.3: AddExpenseForm shows member checkboxes

- Below the Description field, a "Split with" section with a toggle button on the right: shows "Unselect All" when all are checked, "Select All" otherwise
- Each row: checkbox + display name (+ "You" label for the current user)
- All members are checked by default
- Each checked member shows their split amount inline (e.g. "₹150.00")
- Unchecked members do not show an amount
- At least one member must be selected (Save button disabled if none selected)

### SPLIT-1.4: User can uncheck/check members; split amounts update live

- Clicking a checkbox toggles that member's inclusion in the split
- The payer can uncheck themselves (buying for others only)
- Re-checking a member adds them back to the split
- Inline split amounts update live as members are toggled (total / selected count)
- "Select All" checks all members; "Unselect All" unchecks all members

### SPLIT-1.5: createExpense persists expense splits to database

- `createExpense` mutation accepts an additional `splitWith` array of user IDs
- For each selected member, an `expenseSplits` record is created
- Split amount = total expense amount / number of selected members (equal split)
- Both the expense and all splits are created in a single mutation

### SPLIT-1.6: Backend guard — splitWith must contain at least one member

- `createExpense` throws if `splitWith` array is empty

### SPLIT-1.7: Backend guard — splitWith members must be room members

- `createExpense` throws if any userId in `splitWith` is not a member of the room

## Out of Scope

- Unequal splits / percentage splits (future slice)
- Per-item splitting
- Editing splits after creation (EXPENSE-3)

## Tech Notes

- Schema: Add `expenseSplits` table indexed by `expenseId`
- `getRoomMembers` query: join `roomMembers` + `users` tables for the current user's room
- `AddExpenseForm` receives room members as a prop (fetched in `AuthenticatedShell`)
- Split amount stored as number (e.g., 150 for ₹150 when splitting ₹450 three ways)
- Amount division may produce non-terminating decimals — round to 2 decimal places
