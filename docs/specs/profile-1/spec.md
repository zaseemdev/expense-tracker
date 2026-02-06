# PROFILE-1: Enter Display Name on First Login

## Context

After Google OAuth, first-time users must set a display name before using the app. The display name is visible to roommates. Users who already have a display name skip this step.

## Requirements

### PROFILE-1.1: Display name form shown for new users

- Authenticated users without a display name see the display name form
- Heading: "What should we call you?"
- Subtext: "This name will be visible to your roommates"
- Input label: "Display Name", placeholder: "e.g. Jaseem"
- "Continue" button
- Footer: "You can change this later in settings"

### PROFILE-1.2: Continue button disabled when input empty

- Button is disabled until user types at least one non-whitespace character
- Prevents submitting empty display names

### PROFILE-1.3: Submitting display name saves and advances

- Clicking "Continue" calls the setDisplayName mutation
- After save, user sees the main authenticated content

### PROFILE-1.4: Users with existing display name skip the form

- Authenticated users who already have a display name go straight to the main content
- They never see the display name form

## Out of Scope

- Editing display name (SETTINGS-1)
- Avatar/profile picture
- Display name validation beyond non-empty

## Tech Notes

- Backend: `convex/users.ts` with `getDisplayName` query and `setDisplayName` mutation
- Uses `getAuthUserId` from `@convex-dev/auth/server`
- Display name stored on the users document (extend schema with optional `displayName` field)
- Frontend uses `useQuery(api.users.getDisplayName)` and `useMutation(api.users.setDisplayName)`
