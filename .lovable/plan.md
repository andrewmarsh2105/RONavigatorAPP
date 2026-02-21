

# Separate "Paid Date" from "RO Date" for Clarity

## What Changes

Right now, the Paid Date is buried inside the collapsed "More details" section (mobile) or sits right next to the RO Date with the same Calendar icon (desktop), making it easy to confuse the two. We'll pull Paid Date out and give it its own distinct visual treatment so technicians always know:

- **Date** = when the RO was written/opened
- **Paid Date** = when you actually got paid (only fill this in if it's different)

## Mobile (`src/pages/AddRO.tsx`)

Move the Paid Date **out** of the collapsible "More details" section and place it in a small, clearly labeled row directly below the main header strip. It will:

- Show a distinct label: **"Paid on a different day?"** with a tap-to-add style
- When no paid date is set, display as a subtle tappable chip/link: "Paid on a different day? Tap to set"
- When set, show the date with a clear "Paid:" label and an X button to clear it
- Use a different icon (a banknote/dollar icon or a check-circle) instead of Calendar to visually distinguish it from the RO Date

This keeps the main header clean but makes Paid Date visible and obvious without expanding details.

## Desktop (`src/components/desktop/ROEditor.tsx`)

- Add a visible label "Paid Date" next to the input so it's not just two identical calendar inputs side by side
- Add a label "RO Date" to the existing date input as well
- Use a different icon for Paid Date (e.g., `CircleDollarSign` or `CalendarCheck`) to visually separate it

## Technical Details

### File: `src/pages/AddRO.tsx`
- Remove the Paid Date `<div>` from inside the `<CollapsibleContent>` block (lines ~306-325)
- Add a new row between the DetailsCollapsible and the Collapsible sections
- When `paidDate` is empty: render a small tappable text link "Paid on a different day? Tap to set" that reveals the date input
- When `paidDate` is set: render a chip showing "Paid: [date]" with a clear button
- Import `CalendarCheck` from lucide-react for the distinct icon

### File: `src/components/desktop/ROEditor.tsx`
- Add text labels ("RO Date" and "Paid Date") above or beside the respective date inputs (lines ~211-241)
- Change the Paid Date icon from `Calendar` to `CalendarCheck`
- Add placeholder text "Leave empty if same day" to the Paid Date input

