

## Plan: Add TBD Filter to Flag Inbox

The Flag Inbox will get a new "TBD" virtual filter that surfaces all RO lines where `is_tbd = true`. These aren't database flags — they're derived from the RO data already loaded in `ROContext`.

### 1. Update Flag Inbox Components — add TBD filter chip

**Both `FlagInbox.tsx` and `FlagInboxPage.tsx`:**
- Add a "TBD" chip button alongside the existing flag type filter chips (after "All")
- When "TBD" is selected as the active filter, hide the real flags list and instead show TBD lines derived from `ros` in ROContext
- Each TBD item displays: RO number, line number, line description, and labor type
- Clicking a TBD item navigates to the RO (same as flag items)
- No "clear" button on TBD items (they're not flags — user resolves by editing the line)

### 2. Derive TBD items from ROContext

- In both components, compute TBD items: iterate `ros` → `ro.lines` → filter `line.isTbd === true`
- Shape each into a display item with `roId`, `roNumber`, `lineNo`, `description`, and `createdAt`
- Include TBD count in the chip label: `TBD (N)`
- TBD chip only shows when count > 0 (same pattern as other type chips)

### 3. UI behavior

- When TBD filter is active, date range filters are hidden (TBD status is current state, not time-based)
- The "All" chip count remains flags-only; TBD count is separate
- TBD items use a distinct amber/yellow style to differentiate from flags
- Empty state message: "No TBD lines" when filter is active but no TBD lines exist

### Technical Details
- No database changes needed — TBD data comes from existing `ros` in ROContext
- No changes to `useFlags` hook or `FlagContext` — TBD is purely a UI-level filter
- Navigation uses the same `handleFlagTap` / `handleFlagClick` pattern with `roId` and `lineId`

