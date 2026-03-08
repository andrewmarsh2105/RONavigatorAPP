/**
 * src/hooks/useSplitterWidth.ts
 *
 * Persisted splitter width for desktop RO list panel.
 */
import { useCallback, useMemo, useState } from "react";

const KEY = "ui.desktop.splitterWidth.v1";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function useSplitterWidth(opts?: { min?: number; max?: number; initial?: number }) {
  const min = opts?.min ?? 420;
  const max = opts?.max ?? 840;
  const initial = opts?.initial ?? 540;

  const [width, setWidth] = useState<number>(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      const parsed = raw ? Number(raw) : NaN;
      if (Number.isFinite(parsed)) return clamp(parsed, min, max);
      return initial;
    } catch {
      return initial;
    }
  });

  const setClamped = useCallback(
    (next: number) => {
      const value = clamp(next, min, max);
      setWidth(value);
      try {
        window.localStorage.setItem(KEY, String(value));
      } catch {
        // ignore
      }
    },
    [min, max],
  );

  const api = useMemo(() => ({ width, setWidth: setClamped, min, max }), [width, setClamped, min, max]);
  return api;
}
