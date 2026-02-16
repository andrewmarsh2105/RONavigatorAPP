

# Redesign Line Items for Better Visual Hierarchy

## Problem
Currently, each line item card and the "Add Line" button look too similar -- the description input blends in with the surrounding controls, making it hard to quickly identify where to type job descriptions.

## Design Changes

### 1. Make the Description Input Stand Out
- Increase the description input height (h-8 to h-10) and add a visible border so it reads as a proper text field
- Use a white/solid background with a subtle shadow instead of the current flat `bg-background`
- Add a placeholder with more guidance: "Enter job description..."
- Slightly larger font size for the description vs. the secondary controls

### 2. Visually Separate the "Add Line" Button
- Add spacing (margin-top) above the Add Line button to create a clear gap from the line items
- Change the button style from a dashed border card to a more subtle, compact text-button style (e.g., just an icon + text link, or a smaller pill-shaped button) so it doesn't compete with line cards
- Use a muted/ghost style instead of the current card-like appearance

### 3. Line Card Layout Tweaks
- Give line cards a slightly stronger border and background contrast so they feel like distinct "rows"
- Move the line number badge and action buttons (copy/delete) to feel more like row metadata, keeping the description input as the dominant visual element
- Add a thin left accent border (colored by labor type) to each card for quick scanning

## Technical Details

### Files to modify:
1. **`src/components/mobile/CompactLinesGrid.tsx`**
   - Restyle the description input: taller, visible border, slightly larger text, solid background
   - Add a left accent border to each line card based on labor type
   - Increase padding slightly for the description row vs. the controls row

2. **`src/pages/AddRO.tsx`**
   - Restyle the "Add Line" button: change from a full-width dashed-border card to a compact ghost/text button with more top margin
   - Add visual separation (extra spacing or a subtle divider) between the lines list and the add button

### No structural or logic changes needed -- this is purely a styling/layout update.
