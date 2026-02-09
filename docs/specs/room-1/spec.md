# ROOM-1: Create Room (Creator Becomes Admin)

## Context

After setting a display name, users who aren't in a room see a room choice screen. They can create a new room. The creator is automatically assigned the "admin" role. A unique invite code is generated for sharing with roommates.

## Requirements

### ROOM-1.1: Room choice screen shown for users without a room

- Authenticated users with a display name but no room membership see the room choice screen
- Heading: "Get Started"
- Two options: "Create a Room" button and "Join a Room" button (join is disabled/placeholder for ROOM-2)

### ROOM-1.2: Create room form

- Clicking "Create a Room" shows a form
- Input label: "Room Name", placeholder: "e.g. Apartment 4B"
- "Create Room" submit button
- "Back" link to return to room choice screen

### ROOM-1.3: Create room button disabled when input empty

- Button is disabled until user types at least one non-whitespace character

### ROOM-1.4: Creating a room persists to database with admin role

- Submitting the form calls a `createRoom` mutation
- A room document is created with the given name and a generated invite code
- A roomMember document is created linking the user to the room with role "admin"
- The user is redirected to the main app (AuthenticatedShell)

### ROOM-1.5: Invite code is generated and unique

- Each room gets a 6-character alphanumeric invite code
- The code is stored on the room document

### ROOM-1.6: Backend guard — unauthenticated createRoom throws

- Calling createRoom without authentication throws "Not authenticated"

### ROOM-1.7: Backend guard — user already in a room cannot create another

- If a user is already a member of a room, createRoom throws "Already in a room"

## Out of Scope

- Join room flow (ROOM-2)
- Displaying invite link after room creation (future enhancement)
- Room settings/management (SETTINGS-1, ROOM-3/4/5)

## Tech Notes

- Schema: Add `rooms` table (name, inviteCode, createdBy) and `roomMembers` table (roomId, userId, role, joinedAt)
- Backend: New `convex/rooms.ts` with `createRoom` mutation and `getCurrentRoom` query
- `getCurrentRoom` query returns the room info if user is a member, or null
- Invite code generation: 6-char alphanumeric string
- Frontend: New routing layer in `AuthenticatedRouter` — no room → room choice → create room form
