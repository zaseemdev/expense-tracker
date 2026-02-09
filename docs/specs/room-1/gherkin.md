# ROOM-1: Gherkin Scenarios

## ROOM-1.1: Room choice screen

### Scenario: User without a room sees room choice screen
```gherkin
Given an authenticated user with display name "Jaseem"
And the user is not a member of any room
When the authenticated router renders
Then the user sees "Get Started" heading
And the user sees a "Create a Room" button
And the user sees a "Join a Room" button
```

## ROOM-1.2 + ROOM-1.3: Create room form

### Scenario: Clicking "Create a Room" shows the create room form
```gherkin
Given the user is on the room choice screen
When the user clicks "Create a Room"
Then the user sees a "Room Name" input field
And the user sees a "Create Room" button
And the "Create Room" button is disabled
```

### Scenario: Back button returns to room choice
```gherkin
Given the user is on the create room form
When the user clicks "Back"
Then the user sees the room choice screen
```

## ROOM-1.4 + ROOM-1.5: Creating a room persists with admin role

### Scenario: Submitting create room form creates room with admin role
```gherkin
Given the user is on the create room form
When the user types "Apartment 4B" and clicks "Create Room"
Then a room document is created with name "Apartment 4B"
And the room has a 6-character alphanumeric invite code
And a roomMember document exists with the user as "admin"
And the user sees the main authenticated content
```

## ROOM-1.6 + ROOM-1.7: Backend guards

### Scenario: Unauthenticated createRoom throws
```gherkin
Given an unauthenticated client
When createRoom is called with name "Test Room"
Then it throws "Not authenticated"
```

### Scenario: User already in a room cannot create another
```gherkin
Given an authenticated user who is already a member of a room
When createRoom is called with name "Second Room"
Then it throws "Already in a room"
```
