# Polish Queue

Items captured during development for later polish.

## Open

- [ ] **BUG** tdd-guard not catching over-implementation — guards were implemented before their tests existed, and tdd-guard-vitest didn't block the GREEN commit (ROOM-2, commit 6883ee1). The guard should enforce that new implementation code cannot be committed without a corresponding failing test first.
- [ ] **PERF** `/feather:work-slice` re-scans entire project structure and patterns every invocation — should persist project structure and coding patterns to files (e.g. `STRUCTURE.md`, `PATTERNS.md`) that get created on first run and updated incrementally as code evolves, rather than re-exploring from scratch each time. Saves context window and startup time.

## Done

