# Slice State

**Project:** SplitEase - Roommate Expense Tracker
**Platform:** Mobile-first (PWA or React Native)
**Started:** 2026-02-06
**Current Position:** Slice 0 (not started)

## Progress

- [x] Project slicing complete
- [x] UI mockups created (13 screens)
- [ ] Tech stack selection
- [ ] First slice implementation

## Session Log

### 2026-02-06
- Initial project discussion
- Defined 15 slices with dependencies
- Created UI mockups for all major screens
- Confirmed mobile-first approach
- Settlement flow with approve/reject designed
- Navigation pattern: bell icon + banner + settings gear

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

## Next Steps

1. Choose tech stack
2. Run `/feather:work-slice` to start AUTH-1
3. Implement Google OAuth

## Blockers

(None)
