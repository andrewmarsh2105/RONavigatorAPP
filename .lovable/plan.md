

# Add "Paid Date" to Repair Orders

## The Problem

Currently each RO has a single date field (when the RO was opened). When parts are delayed, the tech finishes the job on a different day or week. The hours then show up under the wrong day in the spreadsheet and summary views, making weekly pay period tracking inaccurate.

## The Solution

Add an optional **Paid Date** field to each RO. When set, this date is used for grouping in the spreadsheet and summary calculations. When left empty, the system falls back to the original RO date -- so existing ROs and quick entries still work the same way.

## How It Works for Technicians

- When creating an RO, the "Date" field stays the same (RO open date)
- A new **Paid Date** field appears in the "More details" section
- If parts are delayed, the tech fills in the Paid Date when the job is actually done
- The spreadsheet and weekly summaries group by Paid Date when it exists, otherwise by the RO date
- In the spreadsheet, ROs with a different Paid Date show a small indicator so techs can see it at a glance

## Technical Details

### 1. Database Migration
Add a nullable `paid_date` column to the `ros` table:
```sql
ALTER TABLE public.ros ADD COLUMN paid_date date DEFAULT NULL;
```

### 2. Type Update (`src/types/ro.ts`)
Add `paidDate?: string` to the `RepairOrder` interface.

### 3. Data Layer (`src/hooks/useROStore.ts` and `src/contexts/ROContext.tsx`)
- Map the new `paid_date` DB column to `paidDate` in the RO object during fetch/save
- Include `paid_date` in insert and update operations

### 4. Add RO Form (`src/pages/AddRO.tsx`)
- Add a `paidDate` state field
- Show a "Paid Date" input inside the "More details" collapsible section, right below the existing Date field
- Only visible when the collapsible is expanded, keeping the main form clean

### 5. Desktop Editor (`src/components/desktop/ROEditor.tsx`)
- Add a "Paid Date" input field in the details area

### 6. Spreadsheet View (`src/components/shared/SpreadsheetView.tsx`)
- Use `ro.paidDate || ro.date` as the grouping/sorting key instead of `ro.date`
- When paidDate differs from date, show the original RO date in a smaller muted label so techs know the original open date
- Day separator headers reflect the paid date grouping

### 7. Summary/Report Hook (`src/hooks/usePayPeriodReport.ts`)
- Change the date filter to use `ro.paidDate || ro.date` when determining if an RO falls within the selected range
- This ensures weekly pay period totals reflect when work was actually completed

### 8. RO Detail Sheet (`src/components/sheets/RODetailSheet.tsx`)
- Show Paid Date in the details section when it exists and differs from the RO date

### No Breaking Changes
- `paid_date` is nullable, so all existing ROs continue to work unchanged
- The fallback `paidDate || date` means every view works with or without the new field
- No existing behavior changes unless the tech explicitly sets a Paid Date

