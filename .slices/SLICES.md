# SplitEase - Project Slices

> Mobile-first expense tracker for bachelor roommates

## Slice Overview

| # | ID | Name | Depends On | Status |
|---|-----|------|------------|--------|
| 1 | AUTH-1 | Google OAuth sign in/sign up | — | Pending |
| 2 | PROFILE-1 | Enter display name on first login | AUTH-1 | Pending |
| 3 | ROOM-1 | Create room (creator = admin) | PROFILE-1 | Pending |
| 4 | ROOM-2 | Request to join room (pending approval) | AUTH-1, PROFILE-1 | Pending |
| 5 | EXPENSE-1 | Add expense (date, amount, description) | ROOM-1/2 | Pending |
| 6 | SPLIT-1 | Select roommates to split with | EXPENSE-1 | Pending |
| 7 | EXPENSE-2 | Add another expense (sequential) | SPLIT-1 | Pending |
| 8 | BALANCE-1 | View who owes whom | SPLIT-1 | Pending |
| 9 | HISTORY-1 | View expense history | EXPENSE-1 | Pending |
| 10 | SETTINGS-1 | Settings (rename, logout, room info) | AUTH-1 | Pending |
| 11 | ROOM-3 | Leave room (admin appoints successor) | ROOM-1/2 | Pending |
| 12 | ROOM-4 | Admin approves/rejects join requests | ROOM-2 | Pending |
| 13 | ROOM-5 | Admin kicks a member | ROOM-1 | Pending |
| 14 | SETTLE-1 | Initiate settlement | BALANCE-1 | Pending |
| 15 | SETTLE-2 | View pending settlement requests | SETTLE-1 | Pending |
| 16 | SETTLE-3 | Approve/reject payment | SETTLE-2 | Pending |
| 17 | NOTIFY-1 | Settlement notifications + resubmit | SETTLE-1 | Pending |
| 18 | EXPENSE-3 | Edit expense with audit trail | HISTORY-1 | Pending |
| 19 | BALANCE-2 | View balance breakdown between two members | BALANCE-1 | Pending |

## Slice Details

### AUTH-1: Google OAuth sign in/sign up
- Google OAuth integration
- First-time vs returning user detection
- Redirect to appropriate screen based on user state

### PROFILE-1: Enter display name on first login
- Display name input form (shown only on first sign up)
- Name visible to roommates
- Skip if already set

### ROOM-1: Create room (creator becomes admin)
- Create new room form
- Generate unique invite link
- Creator automatically assigned "admin" role
- Copy link / Share via WhatsApp buttons

### ROOM-2: Request to join room via invite link
- Landing page when clicking invite link
- Show room name, creator, member count
- "Request to Join" button sends request to admin
- Show "Pending approval" status while waiting
- Redirect to home once admin approves

### EXPENSE-1: Add expense (date, amount, description)
- Date picker (default: today)
- Amount input (₹)
- Description text field
- Current user is the payer

### SPLIT-1: Select roommates to split with
- Multi-select checkbox list of all roommates (including payer)
- Payer is selected by default but can uncheck themselves
- "Select All" button
- Live calculation of per-person split amount

### EXPENSE-2: Add another expense (sequential entry flow)
- "Add Another" button after saving
- Clears form, keeps date
- Quick entry for multiple purchases

### BALANCE-1: View who owes whom
- Summary card: your net balance
- List of all roommates with amounts
- Green = they owe you, Red = you owe them
- Yellow banner when pending approvals exist
- Tap person you owe → Settle Up

### HISTORY-1: View expense history
- Expenses grouped by date (Today, Yesterday, etc.)
- Each card: description, amount, who paid, your share
- Most recent first

### SETTINGS-1: Settings page
- Profile section with Edit button (change display name)
- Room info with role badge (Admin/Member)
- Invite Link, Manage Members (admin only)
- Leave Room, Log Out

### ROOM-3: Leave room (admin appoints successor)
- Warning if admin: must appoint new admin
- Select new admin from member list
- Confirm and leave
- Regular members can leave directly

### ROOM-4: Admin approves/rejects join requests
- Admin sees banner: "X wants to join"
- View requester's name and Google profile
- "Approve" or "Reject" buttons
- On approve: user becomes member, notified
- On reject: user notified, can request again later

### ROOM-5: Admin kicks a member
- Access via Settings → Manage Members
- List all members with "Remove" button (except self)
- Confirmation dialog before kicking
- Kicked member notified, redirected to room choice
- Outstanding balances remain (settled separately)

### SETTLE-1: Initiate settlement
- Tap person you owe in Balances
- Enter amount paid (quick buttons: Full, Half, Other)
- "How it works" explainer
- "I Paid" button submits request

### SETTLE-2: View pending settlement requests
- "Pending Approval" section: requests from others
- "Your Pending Requests" section: waiting for confirmation
- Access via yellow banner or notifications

### SETTLE-3: Approve/reject received payment
- "Received ✓" or "Didn't Receive" buttons
- On approve: balance auto-updated
- On reject: payer notified

### NOTIFY-1: Settlement notifications
- Bell icon with badge count
- Approved payments (green): "Rahul confirmed your ₹180"
- Rejected payments (red): "Vijay didn't receive ₹50"
- Resubmit button on rejected

### EXPENSE-3: Edit expense with audit trail
- Edit button on own expenses (in History view)
- Can change: amount, description, date, split members
- All edits logged with timestamp and what changed
- "Edit History" tab visible to all room members
- Shows: who edited, when, old value → new value
- Prevents misuse: everyone sees if ₹50 becomes ₹500

### BALANCE-2: View balance breakdown between two members
- Tap any member in Balances → opens detail view
- Shows net balance at top (they owe you / you owe them)
- List of expenses that contributed to this balance
- Each expense: description, date, amount, your share
- If pending settlement exists: show status banner
- "Settle Up" button (only if you owe them)

## User Flows

### First-time User (Create Room)
```
Sign In → Display Name → Create Room → Home
```

### First-time User (Join Room)
```
Sign In → Display Name → Request Join → Wait for Admin → Home
```

### Returning User (in room)
```
Sign In → Home (Balances)
```

### Returning User (no room)
```
Sign In → Create/Join Room → Home
```

### Settlement Flow
```
Payer: Tap person → Enter amount → I Paid → Wait
Receiver: Banner/Notification → Approve/Reject
Payer: Get notified → (Resubmit if rejected)
```

## Mockups

See `docs/mockups/` for all UI mockups:
- `auth-1-signin.png` - Sign in screen
- `profile-1-name.png` - Display name entry
- `room-choice.png` - Create or Join room
- `room-1-created.png` - Room created with invite link
- `room-2-join.png` - Join room landing page
- `room-2-pending.png` - Waiting for admin approval
- `expense-form.png` - Add expense form
- `home-final.png` - Home screen with navigation
- `history-1.png` - Expense history
- `settings-1.png` - Settings page
- `room-3-leave-admin.png` - Admin leave room
- `room-4-admin-requests.png` - Admin approve/reject join requests
- `room-5-manage-members.png` - Admin kick member
- `settle-1-initiate.png` - Settle up form
- `settle-2-pending.png` - Pending settlements
- `settle-4-notifications.png` - Notifications
- `expense-3-history-edit.png` - History with edit button
- `expense-3-edit-history.png` - Edit history audit trail
- `balance-2-detail.png` - Balance detail (you owe them)
- `balance-2-owes-you.png` - Balance detail (they owe you)
