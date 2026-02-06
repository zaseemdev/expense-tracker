# AUTH-1: Test Scenarios

## AUTH-1.1: Sign-in screen renders

### Scenario: Unauthenticated user sees sign-in screen
```gherkin
Given the user is not authenticated
When the app renders
Then the user sees the "SplitEase" heading
And the user sees "Split expenses with roommates" tagline
And the user sees a "Continue with Google" button
```

## AUTH-1.2: Google OAuth flow

### Scenario: Clicking "Continue with Google" initiates OAuth
```gherkin
Given the user is on the sign-in screen
When the user clicks "Continue with Google"
Then signIn is called with "google" provider
```

## AUTH-1.3: Authenticated routing

### Scenario: Authenticated user does not see sign-in screen
```gherkin
Given the user is authenticated
When the app renders
Then the user does NOT see the "Continue with Google" button
And the user sees authenticated content
```

## AUTH-1.4: Sign out

### Scenario: User signs out and returns to sign-in screen
```gherkin
Given the user is authenticated
When the user clicks the sign-out button
Then signOut is called
And the user sees the sign-in screen
```
