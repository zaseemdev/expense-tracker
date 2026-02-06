# PROFILE-1: Test Scenarios

## PROFILE-1.1: Display name form shown for new users

### Scenario: Authenticated user without display name sees the form

```gherkin
Given the user is authenticated
And the user has no display name
When the app renders
Then the user sees "What should we call you?"
And the user sees a "Display Name" input
And the user sees a "Continue" button
```

## PROFILE-1.2: Continue button disabled when empty

### Scenario: Continue button is disabled when input is empty

```gherkin
Given the user is on the display name form
When the input is empty
Then the "Continue" button is disabled
```

## PROFILE-1.3: Submitting display name

### Scenario: User submits a display name

```gherkin
Given the user is on the display name form
When the user types "Jaseem" into the display name input
And the user clicks "Continue"
Then setDisplayName is called with "Jaseem"
```

## PROFILE-1.4: Skip form for existing users

### Scenario: User with display name skips the form

```gherkin
Given the user is authenticated
And the user has display name "Jaseem"
When the app renders
Then the user does NOT see "What should we call you?"
And the user sees the main authenticated content
```
