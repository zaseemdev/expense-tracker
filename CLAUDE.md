# SplitEase — Project Guide

## Quick Reference

- **Stack:** React 19 + Vite 7 + Convex + React Router 7 + Tailwind CSS v4 + TypeScript 5.9
- **Auth:** `@convex-dev/auth` with Google OAuth
- **Testing:** Vitest 4 + Testing Library + jsdom + tdd-guard-vitest
- **Coverage:** 100% thresholds (lines, branches, functions, statements)

## Commands

```bash
npm run dev              # Start frontend + backend
npm run test             # Vitest watch mode
npm run test:run         # Single run
npm run test:coverage    # Run with 100% coverage check
```

## Project Structure

```text
expense-tracker/
├── CLAUDE.md
├── convex/                       # Backend (Convex functions)
│   ├── schema.ts                 # Database schema (source of truth)
│   ├── auth.ts / auth.config.ts  # Auth setup (Google OAuth)
│   ├── http.ts                   # HTTP routes
│   ├── users.ts                  # User queries/mutations
│   ├── rooms.ts                  # Room queries/mutations
│   ├── expenses.ts               # Expense queries/mutations
│   └── _generated/               # Auto-generated (never edit)
├── src/
│   ├── App.tsx                   # Auth + route wiring (v8 ignore)
│   ├── main.tsx                  # Entrypoint (BrowserRouter + providers, v8 ignore)
│   ├── index.css                 # Global styles
│   ├── screens/                  # Full-screen components (one per route)
│   ├── components/               # Shared UI components (create when needed)
│   ├── hooks/                    # Shared custom hooks (create when needed)
│   ├── lib/                      # Utilities, constants, types (create when needed)
│   └── test/                     # Test infrastructure only (setup, helpers)
├── docs/                         # Feather artifacts
│   ├── DOMAIN.md                 # Domain model + entity relationships
│   ├── specs/<slice-id>/         # spec.md + gherkin.md per slice
│   └── mockups/                  # UI mockup images (<slice-id>-<desc>.png)
└── .slices/                      # Feather workflow state
```

## Folder Conventions

### `src/screens/`

One file per full-screen component. Co-locate tests next to the component.

```text
screens/
├── SignInScreen.tsx
├── SignInScreen.test.tsx
├── AddExpenseForm.tsx
└── AddExpenseForm.test.tsx
```

Only create a new screen file when a slice requires it. Don't preemptively split.

### `src/components/` (create when needed)

Shared, reusable UI components. Only extract here when used by 2+ screens.

### `src/hooks/` (create when needed)

Custom React hooks shared across screens. Only extract when reuse is proven.

### `src/lib/` (create when needed)

Utility functions, constants, type definitions shared across the app.

### `src/test/`

Only test infrastructure (setup files, shared helpers like `renderWithConvex`). Actual test files go next to the code they test.

### `src/App.tsx`

Auth wiring layer, uses `/* v8 ignore */` — tested indirectly through sub-components.

Handles auth guards via conditional rendering (auth state -> display name -> room -> shell). Convex query results drive which screen renders — this is guard logic, not URL routing.

### Routing (React Router 7)

- Auth/profile/room guards are **not** URL routes — they render based on Convex query state in `App.tsx`.
- URL routes live inside `AuthenticatedShell.tsx` using `<Routes>`. Add new routes there.
- `main.tsx` wraps the app with `<BrowserRouter>`. Tests use `<MemoryRouter>` via `renderWithConvex`.

### `convex/`

One file per domain entity. Queries and mutations for the same entity stay together.

```text
convex/
├── users.ts        # getDisplayName, setDisplayName
├── rooms.ts        # createRoom, getCurrentRoom, requestJoinRoom, ...
├── expenses.ts     # createExpense, getExpenses, ...
├── settlements.ts  # (future: SETTLE-* slices)
└── schema.ts       # Single schema file (source of truth)
```

### `docs/specs/<slice-id>/`

Feather creates one folder per slice containing `spec.md` and `gherkin.md`.

### `docs/mockups/`

Named `<slice-id>-<description>.png`. Referenced from spec files.

## Style Conventions

- Mobile-first design (375px viewport)
- Tailwind CSS v4 for all styling
- Currency: Indian Rupee
- The `@` alias maps to `./src` (configured in vitest.config.ts)
