

## Plan: "Hide Totals" Toggle Setting

### Overview
Add a new user setting toggle called "Hide Hours Totals" that, when enabled, replaces all aggregated hour totals (daily, weekly, pay period, monthly) with `--.-h` or similar placeholder text. Individual RO line hours remain visible and editable. The user can toggle it back on to reveal totals again.

### New Setting

**`useUserSettings.ts`** -- Add a new boolean setting `hideTotals` (default: `false`), mapped to DB column `hide_totals`.

**Database migration** -- Add column `hide_totals boolean default false` to `user_settings` table.

### Settings UI

**`SettingsTab.tsx`** -- Add a new toggle row under the "Appearance" settings group:
```
Hide Hour Totals
```
This toggle controls `hideTotals` via `updateUserSetting('hideTotals', v)`.

### Where Totals Get Hidden

The setting will be read via `useFlagContext().userSettings.hideTotals` and applied in these locations:

1. **SummaryTab.tsx (Summary view)**
   - The large "Total Hours" card -- replace `report.totalHours.toFixed(1)` with `--.-`
   - Labor type breakdown pills inside the total card
   - WeekBlock subtotals (`weekTotal`)
   - Grand Total (2 Weeks) row
   - DaySummaryCard `totalHours` display
   - AdvisorCard hours pill
   - By Labor Reference hours
   - Compare view summary cards, delta, daily table values, chart tooltip values

2. **ROsTab.tsx (RO card list)**
   - The `hours-pill` on each ROCard -- keep showing individual RO hours (user said they can still input hours, so per-RO hours stay visible)
   - **No changes here** -- individual RO hours are not "totals"

3. **SpreadsheetView.tsx**
   - Summary footer totals (RO count stays, but total hours, W/CP/I breakdown become `--.-`)
   - Date separator day totals (`dayHours`)
   - RO Total column values
   - Individual line hours remain visible

4. **Desktop ROListPanel** -- If it shows any aggregated totals, hide those too.

### Implementation Approach

Create a small utility function:
```typescript
export function maskHours(value: number, hidden: boolean): string {
  return hidden ? '--.-' : value.toFixed(1);
}
```

This keeps changes minimal -- just swap `.toFixed(1)` calls with `maskHours(value, hideTotals)` at the aggregated total display points.

### What Stays Visible
- Individual line hours on each RO card
- Hours input fields when adding/editing ROs
- Individual line hours in spreadsheet rows (the per-line "Hours" column)
- RO count and line count stats

### What Gets Hidden
- Daily totals (day summary cards, date separators)
- Weekly/biweekly/pay period totals
- Grand totals
- Labor type breakdowns (W/CP/I summaries)
- Spreadsheet footer totals
- RO Total column in spreadsheet
- Compare view totals and deltas

### Technical Details

- **Migration**: `ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS hide_totals boolean DEFAULT false;`
- **Files modified**: `useUserSettings.ts`, `SettingsTab.tsx`, `SummaryTab.tsx`, `SpreadsheetView.tsx`, plus a new `maskHours` utility
- **No breaking changes**: Default is `false`, so existing behavior is unchanged

