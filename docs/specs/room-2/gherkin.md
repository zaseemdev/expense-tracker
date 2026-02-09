# ROOM-2: Gherkin Scenarios

## ROOM-2.1–2.2: Join room form UI

### Scenario: Join a Room button navigates to join form
```gherkin
Given an authenticated user with display name but no room
When they see the room choice screen
Then the "Join a Room" button is enabled
When they click "Join a Room"
Then they see the join room form with heading "Join a Room"
And they see an "Invite Code" input with placeholder "e.g. Xk9mP2"
And the "Request to Join" button is disabled
And there is a "Back" button
```

### Scenario: Back button returns to room choice screen
```gherkin
Given the user is on the join room form
When they click "Back"
Then they see the room choice screen with "Get Started" heading
```

## ROOM-2.3–2.4: Submit join request and pending screen

### Scenario: Submitting valid invite code creates pending request and shows pending screen
```gherkin
Given a room "Apartment 4B" exists with invite code "ABC123"
And an authenticated user with display name but no room
When they navigate to the join form and enter "ABC123"
And they click "Request to Join"
Then a joinRequest is created in the database with status "pending"
And the user sees "Your request to join Apartment 4B is pending approval"
And they see "The room admin will review your request"
```

## ROOM-2.5: Cancel join request

### Scenario: Cancel request deletes join request and returns to room choice
```gherkin
Given the user is on the pending approval screen
When they click "Cancel Request"
Then the joinRequest is deleted from the database
And they see the room choice screen with "Get Started" heading
```

## ROOM-2.6–2.9: Backend guards

### Scenario: Unauthenticated requestJoinRoom throws
```gherkin
Given an unauthenticated client
When they call requestJoinRoom with inviteCode "ABC123"
Then it throws "Not authenticated"
```

### Scenario: Invalid invite code throws
```gherkin
Given an authenticated user
When they call requestJoinRoom with inviteCode "ZZZZZ1"
Then it throws "Invalid invite code"
```

### Scenario: User already in a room cannot request to join
```gherkin
Given an authenticated user who is already a member of a room
When they call requestJoinRoom with a valid inviteCode
Then it throws "Already in a room"
```

### Scenario: User with existing pending request cannot request again
```gherkin
Given an authenticated user who already has a pending join request
When they call requestJoinRoom with a valid inviteCode
Then it throws "Already have a pending request"
```
