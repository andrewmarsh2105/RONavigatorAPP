/**
 * src/hooks/useLocalStorageState.ts
 *
 * LocalStorage-backed React state with safe JSON parsing.
 */
import { useEffect, useRef, useState } from "react";

export function useLocalStorageState<T>(key: string, initialValue: T) {
  const initialRef = useRef(initialValue);

  const [state, setState] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return initialRef.current;
      return JSON.parse(raw) as T;
    } catch {
      return initialRef.current;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // ignore quota / private mode failures
    }
  }, [key, state]);

  return [state, setState] as const;
}
