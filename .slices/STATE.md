# Slice State

**Project:** SplitEase - Roommate Expense Tracker
**Platform:** Mobile-first (PWA or React Native)
**Started:** 2026-02-06
**Current Position:** Slice 4 (ROOM-2 complete)

## Progress

- [x] Project slicing complete
- [x] UI mockups created (13 screens)
- [x] Tech stack selection
- [x] First slice implementation (AUTH-1)

## Session Log

### 2026-02-06
- Initial project discussion
- Defined 15 slices with dependencies
- Created UI mockups for all major screens
- Confirmed mobile-first approach
- Settlement flow with approve/reject designed
- Navigation pattern: bell icon + banner + settings gear

### 2026-02-06 (Session 2)
- Completed AUTH-1: Google OAuth sign-in screen
- Replaced password-based auth with Google OAuth
- New SignInScreen component with SplitEase branding
- Backend switched from Password to Google provider
- 4 tests, 100% coverage
- Next: PROFILE-1 (display name on first login)

## Decisions Made

1. **Authentication:** Google OAuth only (no email/password)
2. **Roles:** Admin and Member (admin = room creator)
3. **Admin transfer:** Required before admin can leave room
4. **Settlement:** External payment (UPI/Cash) + in-app confirmation
5. **Navigation:**
   - Bell icon (🔔) for notifications
   - Gear icon (⚙) for settings
   - Yellow banner for pending approvals
   - Tap person in Balances to settle up
6. **Platform:** Mobile-first design (375px viewport)

## Tech Stack (Already Set Up)

- **Frontend:** React 19 + Vite
- **Backend:** Convex
- **Auth:** @convex-dev/auth (Google OAuth)
- **Styling:** Tailwind CSS v4
- **TypeScript:** 5.9

### 2026-02-09
- Completed PROFILE-1: Enter display name on first login
- Refactored to zero vi.mock() — all tests use convex-test-provider exclusively
- Architecture: lifted useAuthActions to App, sub-components accept callback props
- App function (auth wiring) covered via v8 ignore — tested through sub-components
- 10 tests, 100% coverage
- Next: ROOM-1 (create room)

### 2026-02-09 (Session 2)
- Completed ROOM-1: Create room (creator becomes admin)
- Schema: rooms + roomMembers tables
- Backend: createRoom mutation + getCurrentRoom query
- Frontend: RoomRouter, RoomGate, RoomChoiceScreen, CreateRoomForm
- Refactored App.tsx into separate screen files
- 16 tests, 100% coverage
- Next: ROOM-2 (join room via invite link)

### 2026-02-10
- Completed ROOM-2: Request to join room via invite link
- Join room form with invite code input
- requestJoinRoom mutation creates pending join request
- Pending approval screen with cancel option
- cancelJoinRequest mutation for withdrawing requests
- Backend guard tests for auth, duplicate requests, invalid codes
- Coverage guard tests for getPendingJoinRequest and cancelJoinRequest
- Next: EXPENSE-1 (add expense)

## Next Steps

1. Run `/feather:work-slice` to start EXPENSE-1
2. Add expense with date, amount, description

## Blockers

(None)
