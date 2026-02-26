

## Plan: Add VIN Field to RO Details Section

### Database
- Add `vehicle_vin text` column (nullable) to the `ros` table via migration.

### Type Update
- Add `vin?: string` to `VehicleInfo` interface in `src/types/ro.ts`.

### Data Layer (`src/hooks/useROStore.ts`)
- Map `vehicle_vin` in `dbToRO()` to `vehicle.vin`.
- Include `vehicle_vin` in `addRO()` insert and `updateRO()` update objects.

### UI (`src/components/shared/DetailsCollapsible.tsx`)
- Add a VIN input field in both desktop and mobile layouts, placed after the Vehicle row.
- Show VIN in collapsed summary when present.

### No changes needed to:
- `SpreadsheetView`, `SummaryTab`, `ProofPack` -- VIN is metadata only, not displayed in reports unless requested later.

