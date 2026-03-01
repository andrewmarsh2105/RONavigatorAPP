

# Make Mobile RO List More Compact and Usable

## Current State
Each RO card uses `p-4` padding, three lines of text (RO number row, date/advisor row, work description row), plus a gap of `space-y-3` between cards. This takes up significant vertical space per card.

## Changes

### 1. Compact the ROCard layout (ROsTab.tsx)
- Reduce card padding from `p-4` to `p-3`
- Collapse into a **two-row layout**: RO number + date/advisor on the first row, work description removed (it's accessible in the detail sheet)
- Shrink RO number font from `text-[17px]` to `text-[15px]`
- Move date/advisor inline with RO number instead of on a separate line
- Reduce hours pill from `text-base` to `text-sm`

### 2. Reduce list spacing (ROsTab.tsx)
- Change card list gap from `space-y-3` to `space-y-2`

### 3. Shrink search bar height (ROsTab.tsx)
- Reduce search input and filter buttons from `h-11` to `h-10`
- Reduce search bar container padding from `py-3` to `py-2`

### Result
Each card will be roughly 40% shorter, letting users see 5-7 ROs on screen instead of 3-4. Work description text is still visible when tapping into the detail sheet. All tap targets remain above 44px minimum via the card itself being tappable.

