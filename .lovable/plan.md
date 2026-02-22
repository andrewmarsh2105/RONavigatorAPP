

# Stop Scanned Advisors from Being Added to Advisor Presets

## What Changes
When you scan an RO, the advisor name detected by OCR will still appear on the scan review screen for reference, but it will **not** be applied to the RO form when you tap "Apply." This means scanned advisors won't end up in your advisor presets list (since that list is automatically built from your saved ROs).

You can still manually select or type an advisor after applying the scan -- this only prevents the automatic population.

## Technical Details

### Files to Change

**1. `src/pages/AddRO.tsx`** (mobile flow)
- In the `handleScanApply` function, remove the line that sets the advisor from scan data:
  ```
  // Remove: if (data.advisor) setAdvisor(data.advisor);
  ```

**2. `src/components/desktop/ROEditor.tsx`** (desktop flow)
- Same change -- remove the advisor assignment from `handleScanApply`:
  ```
  // Remove: if (data.advisor) setAdvisor(data.advisor);
  ```

That's it -- two one-line removals. The scan review screen still displays the scanned advisor for your reference, but it won't carry over into the saved RO, so it won't appear in your advisor dropdown for future ROs.

