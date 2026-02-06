# AUTH-1: Google OAuth Sign In/Sign Up

## Context

SplitEase uses Google OAuth as the sole authentication method. Users tap "Continue with Google", complete the OAuth flow, and land in the app. The backend uses `@convex-dev/auth` with the Google provider.

## Requirements

### AUTH-1.1: Sign-in screen renders for unauthenticated users
- App logo and name ("SplitEase") displayed
- Tagline: "Split expenses with roommates"
- "Continue with Google" button with Google icon
- Footer text: "By continuing, you agree to our Terms of Service"

### AUTH-1.2: Google OAuth flow initiates on button click
- Clicking "Continue with Google" calls `signIn("google")`
- User is redirected to Google OAuth consent screen

### AUTH-1.3: Authenticated users bypass sign-in screen
- Users with active session see authenticated content (not the sign-in form)
- `<Authenticated>` / `<Unauthenticated>` from convex/react handle routing

### AUTH-1.4: Sign-out returns to sign-in screen
- Sign-out calls `signOut()` from auth actions
- User returns to the sign-in screen

## Out of Scope
- Display name setup (PROFILE-1)
- Room creation/join routing (ROOM-1, ROOM-2)
- Loading states during auth (can be basic for now)

## Tech Notes
- Replace `Password` provider with `Google` in `convex/auth.ts`
- Google OAuth requires `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` env vars in Convex
- Frontend uses `useAuthActions()` from `@convex-dev/auth/react`
- Mobile-first design (375px viewport)
