

## Multi-User Robustness Improvements

Five targeted hardening changes to prevent data loss and improve reliability when multiple users (or the same user on multiple devices) use the app.

---

### 1. Stale-Edit Detection for RO Updates

**Problem:** If a user opens an RO on two devices and saves from both, the second save silently overwrites the first.

**Solution:** Add an optimistic concurrency check using the `updated_at` timestamp. Before saving, verify the server's `updated_at` matches what we loaded. If it doesn't, warn the user instead of silently overwriting.

**File:** `src/hooks/useROStore.ts` (updateRO function)
- Before performing the update, fetch the current `updated_at` from the server for the RO being edited
- Compare it against the local RO's `updatedAt`
- If they differ, show a toast warning: "This RO was modified elsewhere. Please refresh before editing." and abort the save
- This is a lightweight check -- no schema changes needed

---

### 2. Auth Session Auto-Recovery

**Problem:** If a session token expires mid-use, API calls silently fail or return 401s without the user knowing why.

**Solution:** Add a global auth state listener that detects `TOKEN_REFRESHED` and `SIGNED_OUT` events, and handles edge cases where token refresh fails.

**File:** `src/contexts/AuthContext.tsx`
- Listen for `TOKEN_REFRESHED` event (already handled implicitly by `onAuthStateChange`, but add explicit logging)
- On `SIGNED_OUT` event triggered unexpectedly (not by user action), show a toast: "Your session expired. Please sign in again."
- Add a flag to distinguish user-initiated sign-out from automatic session expiry

---

### 3. QueryClient Stale Time Optimization

**Problem:** Default stale time of 0 causes unnecessary refetches on every component mount, which can cause flicker and extra load under concurrent use.

**Solution:** Set sensible defaults on the QueryClient.

**File:** `src/App.tsx`
- Configure `QueryClient` with `defaultOptions.queries.staleTime: 30_000` (30 seconds)
- Add `refetchOnWindowFocus: false` to prevent refetches on tab switching (the app already handles data freshness via its own fetch logic)

---

### 4. Offline Queue Deduplication

**Problem:** If a user rapidly taps "Save" while offline, the same action could be queued multiple times, leading to duplicate ROs when syncing.

**Solution:** Add deduplication logic to the queue.

**File:** `src/lib/offlineQueue.ts`
- Before enqueuing an `addRO` action, check if an identical action (same type + same `roNumber`) already exists in the queue
- For `updateRO`/`deleteRO`, replace the existing queued action for the same `id` instead of adding a duplicate

**File:** `src/hooks/useOfflineSync.ts`
- Update `queueAction` to call the new deduplication-aware enqueue

---

### 5. Network Error Resilience for Mutations

**Problem:** Network errors during saves (updateRO, deleteRO, flag operations) can leave the UI in an inconsistent state without proper feedback.

**Solution:** Add automatic offline queue fallback for network errors in all mutation functions, matching the pattern already used in `addRO`.

**File:** `src/hooks/useROStore.ts`
- In `updateRO`: catch network-related errors (fetch/network) and fall back to `queueAction('updateRO', ...)` with a toast
- In `deleteRO`: same pattern for network errors

**File:** `src/hooks/useFlags.ts`
- In `addFlag` and `clearFlag`: catch network errors and fall back to offline queue

---

### Technical Summary

| Change | Files Modified | Risk |
|--------|---------------|------|
| Stale-edit detection | useROStore.ts | Very low -- read-only check before write |
| Auth recovery | AuthContext.tsx | Very low -- additional event handling only |
| QueryClient stale time | App.tsx | Very low -- standard config change |
| Queue deduplication | offlineQueue.ts, useOfflineSync.ts | Low -- additive logic |
| Network error fallback | useROStore.ts, useFlags.ts | Low -- extends existing pattern |

No database schema changes or migrations required. No edge function changes needed.
