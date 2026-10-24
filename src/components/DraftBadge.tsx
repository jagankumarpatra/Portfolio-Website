export default function DraftBadge({ note }: { note?: string }) {
  return (
    <span className="inline-block rounded bg-amber-100 px-2 py-0.5 font-mono text-xs font-semibold text-amber-900" title={note}>
      DRAFT · preview only
    </span>
  );
}
