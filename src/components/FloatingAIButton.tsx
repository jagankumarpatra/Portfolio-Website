"use client";

import { Bot } from "lucide-react";
import { usePathname } from "next/navigation";
import { useOverlay } from "@/context/OverlayContext";

/** Rendered only while no overlay (menu, AI modal, node sheet) is open. */
export default function FloatingAIButton({ hideOnHome = false }: { hideOnHome?: boolean }) {
  const pathname = usePathname();
  const { overlayOpen, openOverlay } = useOverlay();
  if (overlayOpen || (hideOnHome && pathname === "/")) return null;
  return (
    <button
      type="button"
      onClick={() => openOverlay("ai")}
      aria-label="Open portfolio Q&A"
      className="button-accent fixed bottom-4 right-4 z-30 flex min-h-11 items-center gap-2 rounded-md px-4 py-3 text-sm font-medium shadow-lg hover:opacity-90"
    >
      <Bot className="h-5 w-5" aria-hidden="true" />
      <span>Portfolio Q&amp;A</span>
    </button>
  );
}
