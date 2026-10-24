"use client";

import "@xyflow/react/dist/style.css";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Background, Controls, MarkerType, ReactFlow, type Edge, type Node } from "@xyflow/react";
import { useOverlay } from "@/context/OverlayContext";
import { trackEvent } from "@/lib/analytics";
import TrackOnMount from "./TrackOnMount";
import DraftBadge from "./DraftBadge";

export type ExplorerNode = {
  id: string; label: string; type: string; x: number; y: number; role: string;
  scaleNote?: string; failureMode?: string; howIWouldBuildToday?: string; status: string;
};
export type ExplorerSystem = {
  id: string; title: string; status: string; caseStudyHref: string | null;
  nodes: ExplorerNode[]; edges: [string, string][];
};

const TYPE_COLOR: Record<string, string> = {
  client: "var(--signal)", service: "var(--accent)", db: "var(--accent2)", external: "var(--signal)",
  queue: "var(--accent2)", storage: "var(--accent2)", observability: "var(--signal)",
};

function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return mobile;
}

export default function Explorer({ systems }: { systems: ExplorerSystem[] }) {
  const params = useSearchParams();
  const deepNode = params.get("node");
  const initial = useMemo(() => {
    if (!deepNode) return null;
    const owner = systems.find((s) => s.nodes.some((n) => n.id === deepNode));
    return owner ? { systemId: owner.id, nodeId: deepNode } : null; // an invalid id is ignored
  }, [deepNode, systems]);

  const [systemId, setSystemId] = useState(initial?.systemId ?? systems[0].id);
  const [selectedId, setSelectedId] = useState<string | null>(initial?.nodeId ?? null);
  // Node pre-selected by a deep link. It is cleared on close or tab switch, and the graph remounts so no stale selection survives.
  const [preselect, setPreselect] = useState<string | null>(initial?.nodeId ?? null);
  const [resetCount, setResetCount] = useState(0);
  const skipTrack = useRef<string | null>(initial?.nodeId ?? null);
  const { overlay, openOverlay, closeOverlay } = useOverlay();
  const isMobile = useIsMobile();

  const system = systems.find((s) => s.id === systemId) ?? systems[0];
  const selected = system.nodes.find((n) => n.id === selectedId) ?? null;

  // The node bottom sheet counts as an overlay, so the floating AI button hides while it is open.
  useEffect(() => {
    if (isMobile && selected) openOverlay("node");
    else if (overlay === "node") closeOverlay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile, selected]);
  useEffect(() => () => closeOverlay(), [closeOverlay]);

  const nodes: Node[] = useMemo(
    () =>
      system.nodes.map((n) => ({
        id: n.id,
        position: { x: n.x, y: n.y },
        data: { label: n.label },
        selected: n.id === preselect,
        ariaLabel: `${n.label}, ${n.type}. Press Enter for details.`,
        style: {
          width: 170, background: "var(--card)", color: "var(--fg)", borderRadius: 8, fontSize: 13,
          border: `1.5px solid ${TYPE_COLOR[n.type] ?? "var(--accent)"}`,
        },
      })),
    [system, preselect],
  );
  const edges: Edge[] = useMemo(
    () =>
      system.edges.map(([a, b]) => ({
        id: `${a}-${b}`, source: a, target: b, type: "smoothstep",
        markerEnd: { type: MarkerType.ArrowClosed, color: "var(--muted)" }, style: { stroke: "var(--muted)" },
      })),
    [system],
  );

  // Stable handler: React Flow re-fires onSelectionChange when the callback identity changes.
  const systemKey = system.id;
  const onSelectionChange = useCallback(
    ({ nodes: sel }: { nodes: { id: string }[] }) => {
      const id = sel[0]?.id ?? null;
      setSelectedId(id);
      if (id && skipTrack.current === id) {
        skipTrack.current = null; // the deep-linked node is not a user click
      } else if (id) {
        trackEvent("architecture_node_click", { systemId: systemKey, nodeId: id });
      }
    },
    [systemKey],
  );

  const closeDetails = () => {
    setSelectedId(null);
    setPreselect(null);
    setResetCount((c) => c + 1);
  };

  const details = selected && (
    <div className="space-y-3 text-sm">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold">{selected.label}</h3>
        {isMobile && (
          <button type="button" onClick={closeDetails} className="rounded-md px-2 py-1 text-muted hover:text-fg" aria-label="Close details">
            Close
          </button>
        )}
      </div>
      <p className="font-mono text-xs uppercase tracking-wide text-muted">{selected.type}</p>
      {selected.status === "draft" && <DraftBadge />}
      <p>{selected.role}</p>
      {selected.scaleNote && <p><strong>Scale:</strong> {selected.scaleNote}</p>}
      {selected.failureMode && <p><strong>Failure mode:</strong> {selected.failureMode}</p>}
      {selected.howIWouldBuildToday && <p><strong>How I would build it today:</strong> {selected.howIWouldBuildToday}</p>}
      {system.caseStudyHref && (
        <Link href={system.caseStudyHref} className="inline-block font-medium text-link underline">Read the case study →</Link>
      )}
    </div>
  );

  return (
    <div>
      <TrackOnMount event="architecture_open" />
      <div role="tablist" aria-label="Systems" className="mb-4 flex flex-wrap gap-2">
        {systems.map((s) => (
          <button
            key={s.id}
            role="tab"
            type="button"
            aria-selected={s.id === system.id}
            onClick={() => {
              setSystemId(s.id);
              setSelectedId(null);
              setPreselect(null);
            }}
            className={`rounded-full border px-4 py-1.5 text-sm ${
              s.id === system.id ? "border-accent bg-accent text-white" : "border-line hover:border-accent"
            }`}
          >
            {s.title}
            {s.status === "draft" ? " (draft)" : ""}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="h-[420px] min-w-0 flex-1 overflow-hidden rounded-lg border border-line bg-card">
          <ReactFlow
            key={`${system.id}-${resetCount}`}
            defaultNodes={nodes}
            defaultEdges={edges}
            fitView
            minZoom={0.3}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable
            onSelectionChange={onSelectionChange}
            colorMode="light"
          >
            <Background color="var(--line)" gap={20} />
            <Controls showInteractive={false} />
          </ReactFlow>
        </div>
        {!isMobile && (
          <aside aria-live="polite" className="w-full rounded-xl border border-line bg-card p-4 md:w-80">
            {details ?? <p className="text-sm text-muted">Select a node to see what it does.</p>}
          </aside>
        )}
      </div>

      {isMobile && selected && (
        <div
          role="dialog"
          aria-label={`${selected.label} details`}
          className="fixed inset-x-0 bottom-0 z-40 max-h-[60vh] overflow-y-auto rounded-t-2xl border border-line bg-card p-5 shadow-2xl"
        >
          {details}
        </div>
      )}
    </div>
  );
}
