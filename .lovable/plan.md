

## Plan: Three Fixes

### 1. Remove "Default Advisor" Setting
The "Default Advisor" row in Settings has an empty `onClick` handler and serves no real function. We will remove:
- The "Defaults" `SettingsGroup` block in `src/components/tabs/SettingsTab.tsx` (lines 468-474)
- The `defaultAdvisor` field from the `Settings` interface in `src/types/ro.ts` (line 71)

### 2. Add Vehicle Search to RO Lists (Desktop + Mobile)
Currently, searching ROs only matches `roNumber`, `advisor`, and `workPerformed`. We will add vehicle fields to the search filter.

**Files to edit:**
- **`src/components/desktop/ROListPanel.tsx`** (lines 35-42): Expand the search filter to also match against `ro.vehicle?.make`, `ro.vehicle?.model`, `ro.vehicle?.year`, and `ro.customerName`.
- **`src/components/tabs/ROsTab.tsx`** (lines 125-133): Same expansion for the mobile RO list search.

The search will match partial strings, e.g. typing "Altima" matches any RO with `vehicle.model === "Altima"`, and typing "2021" or "21" matches the year.

### 3. Fix Proof Pack (Export + Summary)
The Proof Pack CSV and summary text are missing vehicle data, and the summary text has a UTC date bug on line 54.

**`src/lib/exportUtils.ts`:**
- **CSV** (`generateLineCSV`): Add `Vehicle` column after `Customer`. For each line, compute the effective vehicle (line override or RO header) using `formatVehicleChip()` and include it as a column.
- **Summary text** (`generateSummaryText`, line 54): Replace `new Date(d.date)` with local date parsing (`new Date(y, m-1, day)` pattern) to prevent the off-by-one UTC shift in the "BY DAY" section.
- Add the `formatVehicleChip` import from `@/types/ro`.

### Technical Details

**Search matching logic (both desktop + mobile):**
```typescript
const vehicleStr = [
  ro.vehicle?.year?.toString(),
  ro.vehicle?.make,
  ro.vehicle?.model,
  ro.vehicle?.trim,
].filter(Boolean).join(' ').toLowerCase();

result = result.filter((ro) =>
  ro.roNumber.toLowerCase().includes(query) ||
  ro.advisor.toLowerCase().includes(query) ||
  ro.workPerformed.toLowerCase().includes(query) ||
  (ro.customerName || '').toLowerCase().includes(query) ||
  vehicleStr.includes(query)
);
```

**CSV vehicle column:**
```typescript
// After 'Customer' column header, add 'Vehicle'
// For each row, compute:
import { formatVehicleChip } from '@/types/ro';
const vehicleLabel = formatVehicleChip(line.vehicleOverride ? line.lineVehicle : ro.vehicle) || '';
```

**Summary date fix (line 54):**
```typescript
// Replace: const date = new Date(d.date);
const [y, m, day] = d.date.split('-').map(Number);
const date = new Date(y, m - 1, day);
```

### Files Changed
| File | Change |
|------|--------|
| `src/components/tabs/SettingsTab.tsx` | Remove "Defaults" group with "Default Advisor" row |
| `src/types/ro.ts` | Remove `defaultAdvisor` from `Settings` interface |
| `src/components/desktop/ROListPanel.tsx` | Add vehicle + customer to search filter |
| `src/components/tabs/ROsTab.tsx` | Add vehicle + customer to search filter |
| `src/lib/exportUtils.ts` | Add vehicle column to CSV, fix UTC date bug in summary |
