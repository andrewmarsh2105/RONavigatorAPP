/**
 * src/hooks/useUnsavedChangesGuard.ts
 *
 * Blocks navigation when there are unsaved changes (NO autosave).
 */
import { useEffect } from "react";
import { useBlocker } from "react-router-dom";

export function useUnsavedChangesGuard(when: boolean, message?: string) {
  const blocker = useBlocker(when);

  useEffect(() => {
    if (blocker.state !== "blocked") return;

    const ok = window.confirm(message ?? "Discard unsaved changes?");
    if (ok) blocker.proceed();
    else blocker.reset();
  }, [blocker, message]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!when) return;
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [when]);
}
