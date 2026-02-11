# SPLIT-1: Gherkin Scenarios

## SPLIT-1.2: Room members query

### Scenario 1: getRoomMembers returns only current room's members
```gherkin
Given room "Flat 42" with members Alice (admin) and Bob
And room "Villa 7" with members Charlie (admin) and Dave
When getRoomMembers is called by Alice
Then it returns only [{userId: alice, displayName: "Alice"}, {userId: bob, displayName: "Bob"}]
And Charlie and Dave are not included
```

## SPLIT-1.3: Member checkboxes in AddExpenseForm

### Scenario 2: Add expense form shows member checkboxes with split amounts
```gherkin
Given a room with members Alice (payer), Bob, and Charlie
When Alice opens the Add Expense form and enters amount ₹450
Then a "Split with" section appears with an "Unselect All" button (since all are checked)
And checkboxes for Alice (labelled "You"), Bob, and Charlie — all checked
And each checked member shows "₹150.00" inline
```

### Scenario 3: Save button disabled when no members selected
```gherkin
Given Alice has opened the Add Expense form with valid amount and description
And all member checkboxes are unchecked
Then the Save button is disabled
```

## SPLIT-1.4: Toggle member selection

### Scenario 4: Toggling members (including payer) updates inline split amounts
```gherkin
Given Alice has opened the Add Expense form with amount ₹450
And all three members (Alice, Bob, Charlie) are checked showing "₹150.00" each
When Alice unchecks Bob
Then Bob shows no amount, Alice and Charlie each show "₹225.00"
When Alice unchecks herself (buying for others)
Then Alice shows no amount, Charlie shows "₹450.00"
When Alice re-checks Bob
Then Bob and Charlie each show "₹225.00"
```

### Scenario 5: Select All / Unselect All toggles all members
```gherkin
Given Alice has opened the Add Expense form with amount ₹300
And all three members are checked
Then the button shows "Unselect All"
When Alice clicks "Unselect All"
Then all members are unchecked and the button shows "Select All"
When Alice clicks "Select All"
Then all members are checked showing "₹100.00" each and the button shows "Unselect All"
```

## SPLIT-1.5: Expense splits persisted

### Scenario 6: Creating expense with splits persists to database
```gherkin
Given a room with Alice, Bob, and Charlie
When Alice creates a ₹450 expense with all three selected
Then an expense record is created with amount 450
And three expenseSplit records are created, each with amount 150
And each split references the correct userId
```

### Scenario 7: Creating expense with payer unchecked (buying for others)
```gherkin
Given a room with Alice, Bob, and Charlie
When Alice creates a ₹300 expense with only Bob and Charlie selected (herself unchecked)
Then an expense record is created with amount 300
And two expenseSplit records are created, each with amount 150
And no split record references Alice
```

## SPLIT-1.6: Backend guard — empty splitWith

### Scenario 8: createExpense rejects empty splitWith
```gherkin
Given Alice is a room member
When Alice calls createExpense with an empty splitWith array
Then the mutation throws "At least one member must be selected"
```

## SPLIT-1.7: Backend guard — non-member in splitWith

### Scenario 9: createExpense rejects non-room-member in splitWith
```gherkin
Given Alice is a member of "Flat 42"
And Dave is NOT a member of "Flat 42"
When Alice calls createExpense with splitWith containing Dave's userId
Then the mutation throws "All split members must be room members"
```
