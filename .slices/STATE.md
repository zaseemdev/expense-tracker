# Slice State

**Project:** SplitEase - Roommate Expense Tracker
**Platform:** Mobile-first (PWA or React Native)
**Started:** 2026-02-06
**Current Position:** Slice 2 (PROFILE-1 complete)

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

## Next Steps

1. Run `/feather:work-slice` to start ROOM-1
2. Create room with admin role
3. Configure Google OAuth env vars in Convex (`AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`)

## Blockers

(None)
