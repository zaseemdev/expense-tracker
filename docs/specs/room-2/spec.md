# ROOM-2: Request to Join Room via Invite Link (Pending Admin Approval)

## Context

Users who don't have a room can join an existing one by entering an invite code. The invite code is a 6-character alphanumeric string generated when the room was created. Submitting a valid invite code creates a "join request" that the room admin must approve (ROOM-4) before the user becomes a member. This slice covers the joiner's side only.

## Requirements

### ROOM-2.1: "Join a Room" button is enabled on room choice screen

- The "Join a Room" button on the room choice screen is clickable (no longer disabled)
- Clicking it navigates to the join room form

### ROOM-2.2: Join room form

- Shows heading "Join a Room"
- Input label: "Invite Code", placeholder: "e.g. Xk9mP2"
- "Request to Join" submit button
- "Back" link to return to room choice screen

### ROOM-2.3: Submitting a valid invite code creates a pending join request

- Submitting the form calls a `requestJoinRoom` mutation with the invite code
- A `joinRequests` document is created with status "pending", the user's ID, the room ID, and a timestamp
- After successful submission, the user sees a "Pending Approval" screen

### ROOM-2.4: Pending approval screen

- If the user has a pending join request, they automatically see the pending screen (no room choice)
- Shows the room name the user requested to join
- Shows a message: "Your request to join [room name] is pending approval"
- Shows subtext: "The room admin will review your request"
- Shows a "Cancel Request" button

### ROOM-2.5: Cancel request removes join request and returns to room choice

- Clicking "Cancel Request" calls a `cancelJoinRequest` mutation that deletes the pending join request
- User returns to the room choice screen

### ROOM-2.6: Backend guard — unauthenticated requestJoinRoom throws

- Calling `requestJoinRoom` without authentication throws "Not authenticated"

### ROOM-2.7: Backend guard — invalid invite code throws

- Calling `requestJoinRoom` with a code that doesn't match any room throws "Invalid invite code"

### ROOM-2.8: Backend guard — user already in a room cannot request to join

- If the user is already a member of a room, `requestJoinRoom` throws "Already in a room"

### ROOM-2.9: Backend guard — user with existing pending request cannot request again

- If the user already has a pending join request for any room, `requestJoinRoom` throws "Already have a pending request"

## Out of Scope

- Admin approval/rejection flow (ROOM-4)
- Invite link sharing UI (future enhancement)
- Deep link / URL-based invite handling (future enhancement)
- Real-time updates when admin approves (will be handled naturally by Convex reactivity when ROOM-4 is built)

## Tech Notes

- Schema: Add `joinRequests` table with fields: roomId, userId, status, createdAt. Add indexes on `userId` and `roomId_status`.
- Backend: New `requestJoinRoom` mutation and `getPendingJoinRequest` query in `convex/rooms.ts`
- `getPendingJoinRequest` returns the pending request with room info, or null
- Frontend: Add `JoinRoomForm` and `PendingApprovalScreen` components in `RoomGate.tsx`
- Update `RoomGate` view state to include "join" and "pending" views
- The pending approval screen queries `getPendingJoinRequest` to get the room name
