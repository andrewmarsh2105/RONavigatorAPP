

## Fix: Spreadsheet Grouping

### Problem
The `groupBy` dropdown (Date / RO / Advisor / None) in the spreadsheet toolbar is ignored. `buildSpreadsheetRows` on line 179 always groups rows by date regardless of selection.

### Solution
Modify `buildSpreadsheetRows` in `src/lib/buildSpreadsheetRows.ts` to accept a `groupBy` option and re-sort/group accordingly:

- **`date`** (current default): Group by date → day subtotals + RO subtotals within each day.
- **`ro`**: Group by RO number only — each RO gets a subtotal, no day subtotals.
- **`advisor`**: Group by advisor → advisor subtotals, with RO subtotals nested inside.
- **`none`**: Flat list of lines, no RO or day subtotals — only the period subtotal at the end.

### Files Changed

1. **`src/lib/buildSpreadsheetRows.ts`**
   - Add `groupBy?: 'date' | 'ro' | 'advisor' | 'none'` to `BuildRowsOptions`
   - Implement grouping logic for each mode:
     - `date`: existing behavior (no change)
     - `ro`: sort by RO number, emit lines + roSubtotal per RO, skip daySubtotal
     - `advisor`: sort by advisor then RO, emit lines + roSubtotal per RO + advisor subtotal rows
     - `none`: sort by date/RO, emit only line rows + period subtotal

2. **`src/components/shared/SpreadsheetView.tsx`** (line 179)
   - Pass `groupBy` to `buildSpreadsheetRows`:
     ```ts
     buildSpreadsheetRows({ ros: filteredROs, periodLabel: computedRangeLabel, groupBy })
     ```
   - Add `groupBy` to the `useMemo` dependency array

No UI changes needed — the dropdown and all rendering already exist.

