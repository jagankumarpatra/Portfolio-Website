"use client";

import dynamic from "next/dynamic";
import ErrorBoundary from "./ErrorBoundary";
import StaticDiagram from "./StaticDiagram";
import type { ExplorerSystem } from "./Explorer";

// React Flow is loaded only on /system-design and only in the browser.
const Explorer = dynamic(() => import("./Explorer"), {
  ssr: false,
  loading: () => <p className="py-10 text-center text-muted">Loading architecture explorer…</p>,
});

export default function ExplorerLoader({ systems }: { systems: ExplorerSystem[] }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="space-y-4">
          <p className="text-sm text-muted">The interactive view could not load. Here is the static diagram.</p>
          {systems.map((s) => (
            <StaticDiagram key={s.id} system={s} />
          ))}
        </div>
      }
    >
      <Explorer systems={systems} />
    </ErrorBoundary>
  );
}
