

# Move Paid Date to a Better Location

## Problem

On desktop, the Paid Date field sits in the top header strip alongside RO#, Date, Advisor, and Labor Type -- making the header feel crowded. On mobile, the Paid Date field is missing entirely from the QuickAddSheet.

## Solution

Move Paid Date out of the main header and into the "Details" collapsible section on both desktop and mobile. This makes sense because:
- Paid Date is an optional override (most ROs don't need it)
- It logically groups with other secondary metadata (customer, vehicle, mileage)
- It declutters the primary header, keeping only the essential fields: RO#, Date, Advisor, Labor Type

When a Paid Date is set, it will show as a summary chip in the collapsed Details bar (e.g. "Paid 02/20") so it remains visible at a glance.

## Changes

### 1. DetailsCollapsible (`src/components/shared/DetailsCollapsible.tsx`)

- Add `paidDate` and `onPaidDateChange` props
- Add a Paid Date input row in both desktop grid and mobile stacked layouts, positioned as the first field (since it's date-related and most important of the "details" group)
- Show a "Paid: MM/DD" chip in the collapsed summary bar when a paid date is set
- Include a clear button next to the paid date input

### 2. Desktop ROEditor (`src/components/desktop/ROEditor.tsx`)

- Remove the Paid Date field from the sticky header strip (lines 238-259)
- Pass `paidDate` and `onPaidDateChange` props to `DetailsCollapsible`
- Auto-expand Details when editing an RO that already has a paid date set

### 3. Mobile QuickAddSheet (`src/components/sheets/QuickAddSheet.tsx`)

- Add `paidDate` state (currently missing entirely)
- Pass `paidDate` and `onPaidDateChange` to the DetailsCollapsible or add it in the "More Details" accordion section
- Include `paidDate` in the save data

## Files to Modify

| File | Change |
|------|--------|
| `src/components/shared/DetailsCollapsible.tsx` | Add paidDate prop, input row, collapsed summary chip |
| `src/components/desktop/ROEditor.tsx` | Remove paid date from header, pass it to DetailsCollapsible |
| `src/components/sheets/QuickAddSheet.tsx` | Add paidDate state, include in More Details and save data |

