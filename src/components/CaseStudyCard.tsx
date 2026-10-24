import Link from "next/link";

type Props = {
  href: string;
  title: string;
  status: string;
  summary: string;
  tags: string[];
  index: number;
};

export default function CaseStudyCard({ href, title, status, summary, tags, index }: Props) {
  return (
    <Link href={href} className="group flex h-full min-h-64 flex-col rounded-lg border border-line bg-card p-5 transition-colors hover:border-accent focus-visible:border-accent">
      <div className="flex items-center justify-between gap-3 border-b border-line pb-3 text-xs text-muted">
        <span className="eyebrow">Case study</span>
        <span aria-label={`Item ${index}`} className="font-mono tabular-nums">{String(index).padStart(2, "0")}</span>
      </div>
      <div className="space-y-3 py-5">
        <h2 className="text-lg font-semibold leading-snug text-fg group-hover:text-accent">{title}</h2>
        <p className="text-sm font-medium text-accent">{status}</p>
        <p className="text-sm leading-relaxed text-muted">{summary}</p>
      </div>
      <div className="mt-auto flex flex-wrap gap-2 pt-2">
        {tags.slice(0, 6).map((tag) => <span className="tag" key={tag}>{tag}</span>)}
      </div>
      <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent">Read case study <span aria-hidden="true">→</span></span>
    </Link>
  );
}
