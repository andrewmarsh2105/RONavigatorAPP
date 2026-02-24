

## Sort Advisors Alphabetically

Sort the advisor list alphabetically by name in all advisor dropdown/selection UIs across the app.

### Changes

**1. `src/components/desktop/AdvisorCombobox.tsx`**
- Sort the `filtered` advisors array alphabetically by `a.name` before rendering.

**2. `src/components/sheets/QuickAddSheet.tsx`**
- Sort `settings.advisors` alphabetically before slicing the first 4 chips and before rendering the full advisor list in the bottom sheet.

### Technical Details

In both files, apply `.sort((a, b) => a.name.localeCompare(b.name))` to the advisors array before mapping. A copy will be sorted (using spread or `.slice()`) to avoid mutating the original array.

