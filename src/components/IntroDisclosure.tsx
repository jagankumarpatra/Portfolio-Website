"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

export default function IntroDisclosure({ children }: { children: ReactNode }) {
  const [expanded, setExpanded] = useState(true);
  return (
    <section className="relative space-y-6">
      <button type="button" aria-expanded={expanded} onClick={() => setExpanded((value) => !value)} className="inline-flex min-h-11 items-center gap-2 font-mono text-sm text-accent hover:text-fg">
        <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? "" : "-rotate-90"}`} aria-hidden="true" />
        $ intro
      </button>
      <div className={`grid transition-[grid-template-rows,opacity] duration-200 ease-in-out ${expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">{children}</div>
      </div>
    </section>
  );
}
