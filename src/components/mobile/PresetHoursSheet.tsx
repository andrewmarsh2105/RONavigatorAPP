import { useEffect, useMemo, useState } from "react";
import { BottomSheet } from "@/components/mobile/BottomSheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Preset } from "@/types/ro";

const QUICK = [0.3, 0.5, 1.0, 1.5, 2.0, 3.0];

export function PresetHoursSheet(props: {
  open: boolean;
  onClose: () => void;
  preset: Preset | null;
  onConfirm: (hours: number) => void;
}) {
  const preset = props.preset;

  const defaultHours = useMemo(() => {
    if (!preset) return 0;
    return typeof preset.defaultHours === "number" ? preset.defaultHours : 0;
  }, [preset]);

  const [custom, setCustom] = useState("");

  useEffect(() => {
    if (!props.open) return;
    setCustom(defaultHours ? String(defaultHours) : "");
  }, [props.open, defaultHours]);

  const parsed = Number(custom);
  const isValid = Number.isFinite(parsed) && parsed >= 0;

  return (
    <BottomSheet isOpen={props.open} onClose={props.onClose} title={preset?.name ?? "Quick Hours"}>
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-3 gap-2">
          {QUICK.map((h) => (
            <button
              key={h}
              className={cn(
                "h-12 rounded-md font-semibold text-sm border transition-colors min-h-[44px]",
                Number(custom) === h
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary border-border hover:bg-accent"
              )}
              onClick={() => setCustom(String(h))}
            >
              {h}h
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Custom</span>
          <Input
            type="number"
            step="0.1"
            min="0"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="e.g. 0.3"
            className="h-11"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" onClick={props.onClose} className="flex-1 h-11">
            Cancel
          </Button>
          <Button className="flex-1 h-11" disabled={!isValid} onClick={() => props.onConfirm(parsed)}>
            Add line
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
}
