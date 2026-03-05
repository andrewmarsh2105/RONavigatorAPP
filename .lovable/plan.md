

# Fix: White Screen When Leaving Flag Inbox

## Root Cause
The Flag Inbox uses `navigate(-1)` (browser history back) for the back button. If the user navigated directly to `/flag-inbox` (e.g., via a bookmark, refresh, or the preview iframe), there is no previous history entry. `navigate(-1)` navigates to an empty/blank page outside the app, resulting in a white screen.

## Fix

### `src/pages/FlagInboxPage.tsx`
- Change the back button's `onClick` from `navigate(-1)` to `navigate('/')` so it always returns to the home/RO list screen regardless of browser history state.

This is a one-line change on the back button handler.

