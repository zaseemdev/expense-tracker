# SplitEase - Project Slices

> Mobile-first expense tracker for bachelor roommates

## Slice Overview

| # | ID | Name | Depends On | Status |
|---|-----|------|------------|--------|
| 1 | AUTH-1 | Google OAuth sign in/sign up | — | Pending |
| 2 | PROFILE-1 | Enter display name on first login | AUTH-1 | Pending |
| 3 | ROOM-1 | Create room (creator = admin) | PROFILE-1 | Pending |
| 4 | ROOM-2 | Join room via invite link | AUTH-1, PROFILE-1 | Pending |
| 5 | EXPENSE-1 | Add expense (date, amount, description) | ROOM-1/2 | Pending |
| 6 | SPLIT-1 | Select roommates to split with | EXPENSE-1 | Pending |
| 7 | EXPENSE-2 | Add another expense (sequential) | SPLIT-1 | Pending |
| 8 | BALANCE-1 | View who owes whom | SPLIT-1 | Pending |
| 9 | HISTORY-1 | View expense history | EXPENSE-1 | Pending |
| 10 | SETTINGS-1 | Settings (rename, logout, room info) | AUTH-1 | Pending |
| 11 | ROOM-3 | Leave room (admin appoints successor) | ROOM-1/2 | Pending |
| 12 | SETTLE-1 | Initiate settlement | BALANCE-1 | Pending |
| 13 | SETTLE-2 | View pending settlement requests | SETTLE-1 | Pending |
| 14 | SETTLE-3 | Approve/reject payment | SETTLE-2 | Pending |
| 15 | NOTIFY-1 | Settlement notifications + resubmit | SETTLE-1 | Pending |

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

### ROOM-2: Join room via invite link (as member)
- Landing page when clicking invite link
- Show room name, creator, existing members
- Join button assigns "member" role
- Redirect to home after joining

### EXPENSE-1: Add expense (date, amount, description)
- Date picker (default: today)
- Amount input (₹)
- Description text field
- Current user is the payer

### SPLIT-1: Select roommates to split with
- Multi-select checkbox list of roommates
- "Select All" button
- Live calculation of per-person split amount
- Payer is auto-included in split

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

## User Flows

### First-time User
```
Sign In → Display Name → Create/Join Room → Home
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
- `expense-form.png` - Add expense form
- `home-final.png` - Home screen with navigation
- `history-1.png` - Expense history
- `settings-1.png` - Settings page
- `room-3-leave-admin.png` - Admin leave room
- `settle-1-initiate.png` - Settle up form
- `settle-2-pending.png` - Pending settlements
- `settle-4-notifications.png` - Notifications
