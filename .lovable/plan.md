

# Add Favorites to Preset Quick Rail

## Overview

Add a "favorite" toggle to labor presets so favorited presets appear first in the quick-add rail when editing an RO. Users can star/unstar presets from Settings, and favorites will be sorted to the front of the rail on both desktop and mobile.

## Changes

### 1. Database Migration

Add an `is_favorite` boolean column to the `labor_references` table:

```sql
ALTER TABLE labor_references ADD COLUMN is_favorite boolean NOT NULL DEFAULT false;
```

### 2. Types (`src/types/ro.ts`)

Add `isFavorite?: boolean` to the `Preset` interface.

### 3. Data Layer (`src/hooks/useROStore.ts`)

- Update `dbToPreset` to map `row.is_favorite` to the Preset object.
- Update `updatePresets` to include `is_favorite` in the insert rows.

### 4. PresetSearchRail (`src/components/shared/PresetSearchRail.tsx`)

- Accept a `favoriteIds` prop (or read `isFavorite` from presets directly).
- Sort filtered presets so favorites come first.
- Show a small star icon on favorite preset chips to visually distinguish them.
- Add a subtle separator (a thin divider or extra gap) between the favorites group and the rest.

### 5. Settings - Preset Management (`src/components/tabs/SettingsTab.tsx`)

- Add a star toggle button on each preset row in the preset list.
- Tapping the star toggles `isFavorite` on that preset and saves via `updatePresets`.

### 6. LineItemEditor (`src/components/mobile/LineItemEditor.tsx`)

No changes needed -- it already passes presets to `PresetSearchRail`, which will handle the sorting internally.

## Technical Details

| File | Change |
|------|--------|
| Database migration | Add `is_favorite boolean DEFAULT false` to `labor_references` |
| `src/types/ro.ts` | Add `isFavorite?: boolean` to `Preset` |
| `src/hooks/useROStore.ts` | Map `is_favorite` in `dbToPreset`, include in `updatePresets` insert |
| `src/components/shared/PresetSearchRail.tsx` | Sort favorites first, show star icon on favorites, subtle visual separator |
| `src/components/tabs/SettingsTab.tsx` | Add star toggle button on each preset row |

