export type DiagramNode = { id: string; label: string; x: number; y: number; type?: string };
export type DiagramSystem = { id: string; title: string; nodes: DiagramNode[]; edges: [string, string][] };

const W = 170;
const H = 44;
const PAD = 20;

/** Plain SVG used when JavaScript is off or the interactive graph fails. */
export default function StaticDiagram({ system }: { system: DiagramSystem }) {
  const minX = Math.min(...system.nodes.map((n) => n.x)) - PAD;
  const minY = Math.min(...system.nodes.map((n) => n.y)) - PAD;
  const maxX = Math.max(...system.nodes.map((n) => n.x + W)) + PAD;
  const maxY = Math.max(...system.nodes.map((n) => n.y + H)) + PAD;
  const byId = new Map(system.nodes.map((n) => [n.id, n]));

  return (
    <svg
      role="img"
      aria-label={`Architecture diagram: ${system.title}; nodes: ${system.nodes.map((node) => node.label).join(", ")}`}
      viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`}
      className="h-auto w-full rounded-lg border border-line bg-card"
    >
      <title>{system.title}</title>
      <desc>{`Components and connections in ${system.title}: ${system.nodes.map((node) => node.label).join(", ")}.`}</desc>
      {system.edges.map(([a, b]) => {
        const from = byId.get(a);
        const to = byId.get(b);
        if (!from || !to) return null;
        return (
          <line
            key={`${a}-${b}`}
            x1={from.x + W}
            y1={from.y + H / 2}
            x2={to.x}
            y2={to.y + H / 2}
            stroke="var(--line)"
            strokeWidth={2}
          />
        );
      })}
      {system.nodes.map((n) => {
        const shape = n.type === "db"
          ? <path d={`M ${n.x} ${n.y + 8} C ${n.x} ${n.y - 2}, ${n.x + W} ${n.y - 2}, ${n.x + W} ${n.y + 8} L ${n.x + W} ${n.y + H - 8} C ${n.x + W} ${n.y + H + 2}, ${n.x} ${n.y + H + 2}, ${n.x} ${n.y + H - 8} Z M ${n.x} ${n.y + 8} C ${n.x} ${n.y + 18}, ${n.x + W} ${n.y + 18}, ${n.x + W} ${n.y + 8}`} fill="var(--card)" stroke="var(--accent)" strokeWidth={1.5} />
          : n.type === "queue"
            ? <polygon points={`${n.x + 14},${n.y} ${n.x + W},${n.y} ${n.x + W - 14},${n.y + H} ${n.x},${n.y + H}`} fill="var(--card)" stroke="var(--accent2)" strokeWidth={1.5} />
            : n.type === "external" || n.type === "client"
              ? <polygon points={`${n.x + 14},${n.y} ${n.x + W - 14},${n.y} ${n.x + W},${n.y + H / 2} ${n.x + W - 14},${n.y + H} ${n.x + 14},${n.y + H} ${n.x},${n.y + H / 2}`} fill="var(--card)" stroke="var(--signal)" strokeWidth={1.5} />
              : n.type === "decision"
                ? <polygon points={`${n.x + W / 2},${n.y} ${n.x + W},${n.y + H / 2} ${n.x + W / 2},${n.y + H} ${n.x},${n.y + H / 2}`} fill="var(--card)" stroke="var(--signal)" strokeWidth={1.5} />
                : <rect x={n.x} y={n.y} width={W} height={H} rx={8} fill="var(--card)" stroke="var(--accent)" strokeWidth={1.5} />;
        return (
        <g key={n.id}>
          {shape}
          <text x={n.x + W / 2} y={n.y + H / 2 + 5} textAnchor="middle" fill="var(--fg)" fontSize={14} fontFamily="sans-serif">
            {n.label}
          </text>
        </g>
      );
      })}
    </svg>
  );
}
