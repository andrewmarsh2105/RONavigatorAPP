export function maskHours(value: number, hidden: boolean): string {
  return hidden ? '--.-' : value.toFixed(1);
}
