# EXPENSE-1: Gherkin Scenarios

## EXPENSE-1.1: Shell with room name and FAB

### Scenario: Room member sees room name and "+" FAB
```gherkin
Given an authenticated user who is a member of room "Flat 42"
When the AuthenticatedShell renders
Then the header shows "Flat 42 Expenses"
And they see a green "+" FAB button at the bottom-right
```

## EXPENSE-1.2: Add expense form

### Scenario: Tapping "+" FAB shows the add expense form
```gherkin
Given an authenticated user in a room viewing the shell
When they click the "+" FAB
Then they see a full-screen "Add Expense" form
And fields appear in order: Date (defaults to today), Amount, Description
And a "Save" button is visible
And a "Close" button (×) is visible in the header
```

### Scenario: Close button returns to shell
```gherkin
Given a user viewing the add expense form
When they click the close (×) button
Then they return to the shell
```

## EXPENSE-1.3: Save button disabled

### Scenario: Save button disabled when fields empty, enabled when filled
```gherkin
Given a user viewing the add expense form
Then the "Save" button is disabled
When they enter a description and amount > 0
Then the "Save" button is enabled
```

## EXPENSE-1.4: Creating expense persists

### Scenario: Submitting expense form creates expense in database
```gherkin
Given an authenticated user in a room viewing the add expense form
When they fill in amount "450", description "Groceries - milk, bread", and click Save
Then an expense document is created with the correct roomId, paidBy, amount, date, and description
And the form closes and returns to the shell
```

## EXPENSE-1.5: Backend guard — unauthenticated createExpense

### Scenario: Unauthenticated createExpense throws
```gherkin
Given no authentication
When createExpense is called
Then it throws "Not authenticated"
```

## EXPENSE-1.6: Backend guard — non-member createExpense

### Scenario: Non-member createExpense throws
```gherkin
Given an authenticated user who is NOT a member of the room
When createExpense is called for that room
Then it throws "Not a room member"
```
