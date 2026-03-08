/**
 * src/lib/haptics.ts
 *
 * Safe haptics helper for mobile web/PWA.
 */
type Pattern = number | number[];

function vibrate(pattern: Pattern) {
  try {
    if ("vibrate" in navigator) {
      navigator.vibrate(pattern);
      return;
    }
  } catch {
    // ignore
  }
}

export const haptics = {
  light: () => vibrate(10),
  medium: () => vibrate(20),
  success: () => vibrate([10, 30, 10]),
  warning: () => vibrate([20, 40, 20]),
};
