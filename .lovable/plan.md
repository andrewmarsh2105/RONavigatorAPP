

# Move Pay Period Comparison to Its Own Tab

## Problem
The comparison section (chart + table + summary cards) is wedged between the Total Card and Daily Breakdown, pushing important daily data down the page -- especially painful on mobile.

## Solution
Add a "Compare" option to the existing `SegmentedControl` at the top of the Summary tab. When selected, the entire content area shows only the comparison UI (date pickers, summary cards, chart, daily table, labor breakdown). The regular summary views (1 Week, 2 Weeks, Custom) remain unchanged with no comparison section inline.

## Changes

### File: `src/components/tabs/SummaryTab.tsx`

1. **Add "Compare" to SegmentedControl options** (Pro users only)
   - Add `{ value: 'compare', label: 'Compare' }` to the options array
   - Only include this option when `isPro` is true

2. **Conditionally render content based on segment value**
   - When `segmentValue === 'compare'`: render only the `MultiPeriodComparison` component (with its own date pickers, chart, table)
   - Otherwise: render the existing summary content (Total Card, warnings, daily breakdown, advisors, etc.)

3. **Remove inline comparison** from the regular summary views
   - Remove the `{isPro && <MultiPeriodComparison ... />}` block currently at line 509-514

4. **Hide the custom date range pickers** when in Compare mode (Compare has its own date pickers inside the component)

5. **Hide the period label row** ("Feb 16 - Feb 22") when in Compare mode since it doesn't apply

## Result
- Regular summary views: Total Card, warnings, daily breakdown, advisors, labor refs, export -- no comparison clutter
- Compare view: Full-screen comparison with all the chart/table/delta detail, nothing else competing for attention
- Clean toggle between modes via the top segmented control
