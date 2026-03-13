import type { ROLine } from "@/types/ro";
import { calcLineHours } from "@/lib/roDisplay";

export function getLineTotals(lines: ROLine[]) {
  return { paidHours: Number(calcLineHours(lines).toFixed(2)) };
}
