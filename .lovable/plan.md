

# Fix Timezone-Shifted Dates in Spreadsheet View

## Problem
Two places in `SpreadsheetView.tsx` create JavaScript `Date` objects from `"YYYY-MM-DD"` strings, which JavaScript interprets as UTC midnight. In any timezone west of UTC, this shifts the displayed date back by one day.

## Fix (single file: `src/components/shared/SpreadsheetView.tsx`)

### 1. Date column in each row (line 166)
Replace:
```ts
const formattedDate = new Date(row.ro.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
```
With a local parse that splits the `"YYYY-MM-DD"` string and constructs a local `Date`:
```ts
const [y, m, d] = row.ro.date.split('-').map(Number);
const formattedDate = new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
```

### 2. Day separator label (line 56, inside the `useMemo`)
Replace:
```ts
const dateLabel = format(parseISO(dateKey), 'EEE, MMM d');
```
With:
```ts
const [y, m, d] = dateKey.split('-').map(Number);
const dateLabel = format(new Date(y, m - 1, d), 'EEE, MMM d');
```
This constructs a local-timezone `Date` so the day-of-week and day number are correct.

The `parseISO` import from `date-fns` can also be removed since it will no longer be used.
