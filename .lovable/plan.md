
# Compact Preset Items in Settings

## What Changes

The preset list in Settings currently uses large cards with `p-4` padding and `rounded-xl`, taking up a lot of vertical space. We'll make them more compact by:

- Reducing padding from `p-4` to `px-3 py-2`
- Using smaller rounded corners (`rounded-lg` instead of `rounded-xl`)
- Reducing the gap between items from `space-y-2` to `space-y-1`
- Making the text slightly smaller (name stays normal, subtitle uses `text-xs`)
- Shrinking the edit/delete button tap targets from `p-2` to `p-1.5`

## Technical Details

### File: `src/components/tabs/SettingsTab.tsx`

**PresetItem component (lines 87-110):**
- Change container from `p-4 rounded-xl` to `px-3 py-2 rounded-lg`
- Reduce icon button padding from `p-2` to `p-1.5`

**Preset list container (line 533):**
- Change `space-y-2` to `space-y-1`

This keeps all existing functionality (edit, delete) intact while making the list denser so you can see more presets at once without scrolling.
