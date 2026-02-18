
## Customizable Week Start Day for the "Week" Filter

### What the User Wants

Right now, the "Week" filter always shows the last 7 rolling days. The user wants to define which day their work week starts on (e.g. Monday), so that "Week" shows from that day of the current week up to today — not a rolling 7-day window.

**Example:** If week start = Monday and today is Thursday, the "Week" filter shows Monday → Thursday only.

---

### How It Works Today

Both `ROsTab.tsx` (mobile) and `ROListPanel.tsx` (desktop) have identical "week" logic:

```
weekAgo = today - 7 days
filter: ro.date >= weekAgo
```

This is a rolling window, not a real calendar week. There is no user preference for week start day.

---

### Where the Changes Go

**4 places total:**

#### 1. Database migration — add `week_start_day` column to `user_settings`

A new integer column `week_start_day` (0 = Sunday, 1 = Monday ... 6 = Saturday), defaulting to `0` (Sunday). This follows the standard JavaScript `Date.getDay()` convention, making the math straightforward with no conversion needed.

```sql
ALTER TABLE public.user_settings
  ADD COLUMN IF NOT EXISTS week_start_day integer NOT NULL DEFAULT 0;
```

#### 2. `src/hooks/useUserSettings.ts` — add the new setting

- Add `weekStartDay: number` (0–6) to the `UserSettings` interface
- Add default value `weekStartDay: 0`
- Read `data.week_start_day` from the database fetch
- Add `weekStartDay → week_start_day` to the `dbKey` mapping in `updateSetting`

#### 3. `src/components/tabs/SettingsTab.tsx` — add the setting UI

Add a new "Week Start Day" section (or row) inside the existing **Summary Range** settings card. It will render 7 day buttons (Sun / Mon / Tue / Wed / Thu / Fri / Sat) as a horizontal scrollable chip row, similar to the existing segmented controls. Tapping a day calls `updateUserSetting('weekStartDay', dayIndex)` and saves immediately.

**Placement:** Directly below the existing "Summary Range" segmented control, within the same card/section.

#### 4. `src/components/tabs/ROsTab.tsx` and `src/components/desktop/ROListPanel.tsx` — use the setting in the "week" filter

Replace the hard-coded `today - 7 days` logic with a calculation that finds the most recent occurrence of the configured `weekStartDay`:

```typescript
// Compute the start of the current week based on user preference
function getWeekStart(weekStartDay: number): string {
  const now = new Date();
  const todayDow = now.getDay(); // 0=Sun, 6=Sat
  const diff = (todayDow - weekStartDay + 7) % 7; // days since week started
  const start = new Date(now);
  start.setDate(now.getDate() - diff);
  return `${start.getFullYear()}-${String(start.getMonth()+1).padStart(2,'0')}-${String(start.getDate()).padStart(2,'0')}`;
}
```

Then the filter becomes:
```typescript
} else if (filters.dateRange === 'week') {
  const weekStart = getWeekStart(userSettings.weekStartDay ?? 0);
  result = result.filter((ro) => ro.date >= weekStart);
}
```

Both `ROsTab` and `ROListPanel` get this same updated logic. `ROsTab` already has access to `userSettings` via `useFlagContext()`. `ROListPanel` also uses `useFlagContext()` so no new context wiring is needed.

---

### Technical Details

- **No timezone risk**: The calculation uses `new Date()` to get the local day-of-week, then subtracts days from the local date — consistent with the app's existing local date strategy (no UTC conversions).
- **Edge case — today IS the start day**: `diff = 0`, so `weekStart = today`. Only today's ROs show. This is correct: the week just started.
- **If user never set a preference**: defaults to `0` (Sunday), matching current behavior closely (7-day window is replaced by a Sun-to-today window — essentially the same for most of the week).
- **Both mobile and desktop**: The filter logic change is applied to both `ROsTab.tsx` and `ROListPanel.tsx` since they both have independent week filter implementations.

---

### Summary of Files Changed

| File | Change |
|---|---|
| New migration SQL | Add `week_start_day integer DEFAULT 0` to `user_settings` |
| `src/hooks/useUserSettings.ts` | Add `weekStartDay` field, read/write mapping |
| `src/components/tabs/SettingsTab.tsx` | Add day-picker UI in Summary Range section |
| `src/components/tabs/ROsTab.tsx` | Replace rolling 7-day week filter with calendar-week logic |
| `src/components/desktop/ROListPanel.tsx` | Same week filter update as above |
