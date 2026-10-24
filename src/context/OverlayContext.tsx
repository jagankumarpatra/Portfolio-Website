"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

export type OverlayKind = "none" | "menu" | "search" | "ai" | "node";

type OverlayContextType = {
  overlay: OverlayKind;
  /** True while the mobile menu, the AI modal or a node bottom sheet is open. */
  overlayOpen: boolean;
  pendingQuery: string | null;
  openOverlay: (kind: Exclude<OverlayKind, "none">, query?: string) => void;
  closeOverlay: () => void;
  clearPendingQuery: () => void;
};

const OverlayContext = createContext<OverlayContextType | undefined>(undefined);

export function OverlayProvider({ children }: { children: React.ReactNode }) {
  const [overlay, setOverlay] = useState<OverlayKind>("none");
  const [pendingQuery, setPendingQuery] = useState<string | null>(null);

  const openOverlay = useCallback((kind: Exclude<OverlayKind, "none">, query?: string) => {
    setOverlay(kind);
    if (query !== undefined) setPendingQuery(query);
  }, []);
  const closeOverlay = useCallback(() => setOverlay("none"), []);
  const clearPendingQuery = useCallback(() => setPendingQuery(null), []);

  const value = useMemo(
    () => ({ overlay, overlayOpen: overlay !== "none", pendingQuery, openOverlay, closeOverlay, clearPendingQuery }),
    [overlay, pendingQuery, openOverlay, closeOverlay, clearPendingQuery],
  );
  return <OverlayContext.Provider value={value}>{children}</OverlayContext.Provider>;
}

export function useOverlay() {
  const ctx = useContext(OverlayContext);
  if (!ctx) throw new Error("useOverlay must be used within an OverlayProvider");
  return ctx;
}
