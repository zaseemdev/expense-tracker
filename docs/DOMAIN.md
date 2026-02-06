# Domain Model

## Entity Relationship

```
User
├── id (unique)
├── email (from Google)
├── displayName
├── avatarUrl (from Google, optional)
├── createdAt
└── room → Room (nullable, user may not be in a room)

Room
├── id (unique)
├── name
├── inviteCode (unique, short code like "Xk9mP2")
├── createdAt
├── createdBy → User
└── members → [RoomMember]

RoomMember
├── id (unique)
├── room → Room
├── user → User
├── role: "admin" | "member"
├── joinedAt
└── (composite unique: room + user)

Expense
├── id (unique)
├── room → Room
├── paidBy → User
├── amount (decimal, in ₹)
├── description
├── date
├── createdAt
└── splits → [ExpenseSplit]

ExpenseSplit
├── id (unique)
├── expense → Expense
├── user → User
├── amount (decimal, calculated share)
└── (composite unique: expense + user)

Settlement
├── id (unique)
├── room → Room
├── fromUser → User (payer)
├── toUser → User (receiver)
├── amount (decimal)
├── status: "pending" | "approved" | "rejected"
├── createdAt
├── respondedAt (nullable)
└── note (optional message)

Notification
├── id (unique)
├── user → User (recipient)
├── type: "settlement_request" | "settlement_approved" | "settlement_rejected"
├── relatedSettlement → Settlement
├── read: boolean
├── createdAt
└── message
```

## Visual Diagram

```
┌──────────┐       ┌──────────┐       ┌─────────────┐
│   User   │◄──────│RoomMember│──────►│    Room     │
└──────────┘       └──────────┘       └─────────────┘
     │                                       │
     │                                       │
     ▼                                       ▼
┌──────────┐       ┌──────────┐       ┌─────────────┐
│Settlement│       │  Expense │──────►│ExpenseSplit │
└──────────┘       └──────────┘       └─────────────┘
     │
     ▼
┌──────────────┐
│ Notification │
└──────────────┘
```

## Key Concepts

### User
- Authenticated via Google OAuth
- Has a display name (set on first login)
- Can be in zero or one room at a time
- Has a role within the room (admin or member)

### Room
- Created by a user (who becomes admin)
- Has a unique invite code for sharing
- Contains multiple members (RoomMember)
- All expenses and settlements belong to a room

### RoomMember
- Junction table between User and Room
- Stores the role (admin/member)
- Only one admin per room at a time
- Admin must transfer before leaving

### Expense
- Paid by one user
- Split among selected roommates
- Each split stores the calculated share amount
- Date defaults to today but can be changed

### ExpenseSplit
- One entry per user included in the split
- Amount = total expense / number of people
- Used to calculate balances

### Settlement
- Records a payment claim from one user to another
- Status flow: pending → approved/rejected
- On approved: affects balance calculations
- On rejected: payer can resubmit (creates new Settlement)

### Notification
- In-app notifications for settlement events
- Shown via bell icon with badge count
- Types: request received, approved, rejected

## Balance Calculation

```
For User A's balance with User B:

1. Sum all ExpenseSplits where:
   - A paid, B is in split → B owes A
   - B paid, A is in split → A owes B

2. Sum all approved Settlements where:
   - A paid B → reduces A owes B
   - B paid A → reduces B owes A

3. Net balance = (B owes A) - (A owes B) - settlements
```

## Constraints

1. **One room per user:** User can only be in one room at a time
2. **One admin per room:** Exactly one member has admin role
3. **Admin transfer required:** Admin cannot leave without appointing successor
4. **No self-split:** Payer is always included in split by default
5. **Positive amounts only:** All amounts must be > 0
6. **Settlement limits:** Cannot settle more than owed amount
