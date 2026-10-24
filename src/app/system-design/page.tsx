import type { Metadata } from "next";
import { Suspense } from "react";
import ExplorerLoader from "@/components/ExplorerLoader";
import StaticDiagram from "@/components/StaticDiagram";
import { getCaseStudies, getSystems } from "@/lib/content";
import Link from "next/link";

export const metadata: Metadata = {
  title: "System Design",
  description: "Verified interface-level request flows from backend work, without inferred infrastructure details.",
  alternates: { canonical: "/system-design" },
  openGraph: { title: "System Flow", description: "Verified interface-level request flows from backend work.", type: "website" },
};

export default function SystemDesignPage() {
  const cases = getCaseStudies();
  const slugs = new Set(cases.map((c) => c.slug));
  const systems = getSystems().map((s) => ({
    id: s.id,
    title: s.title,
    status: s.status,
    caseStudySlug: s.caseStudySlug,
    caseStudyHref: s.caseStudySlug && slugs.has(s.caseStudySlug) ? `/projects/${s.caseStudySlug}` : null,
    nodes: s.nodes.map((n) => ({
      id: n.id, label: n.label, type: n.type, x: n.x, y: n.y, role: n.role,
      scaleNote: n.scaleNote, failureMode: n.failureMode, howIWouldBuildToday: n.howIWouldBuildToday, status: n.status,
    })),
    edges: s.edges,
  }));

  return (
    <div className="editorial-page space-y-12">
      <header className="space-y-3">
        <p className="eyebrow">Technical deep dive</p>
        <h1 className="text-3xl font-semibold tracking-tight text-fg md:text-4xl">System flow</h1>
        <p className="max-w-[68ch] text-muted">
        Interface-level flows based on documented work. These are not full infrastructure diagrams; unverified queues, storage and hosting details are intentionally omitted.
        </p>
      </header>

      {systems.length === 0 ? (
        <p className="text-muted">No approved systems yet.</p>
      ) : (
        <>
          {systems.map((system, index) => {
            const project = cases.find((item) => item.slug === system.caseStudySlug);
            return (
              <section key={system.id} id={system.caseStudySlug ?? system.id} className="scroll-mt-24 space-y-6 border-t border-line pt-8">
                <header className="space-y-3">
                  <p className="eyebrow">{String(index + 1).padStart(2, "0")} · {system.status === "draft" ? "review required" : "verified interface flow"}</p>
                  <h2 className="text-2xl font-semibold tracking-tight text-fg">{system.title}</h2>
                  {project && <p className="max-w-3xl text-muted">{project.impact}</p>}
                  <div className="flex flex-wrap gap-2">{project?.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div>
                  {system.caseStudyHref && <Link href={system.caseStudyHref} className="inline-block text-sm font-semibold text-accent hover:underline">Read the case study →</Link>}
                </header>
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-fg">Request flow</h3>
                  <StaticDiagram system={system} />
                </div>
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-fg">Interactive explorer</h3>
                  <Suspense fallback={<p className="py-8 text-muted">Loading interactive architecture…</p>}>
                    <ExplorerLoader systems={[system]} />
                  </Suspense>
                </div>
                <details className="rounded-lg border border-line bg-card p-5">
                  <summary className="cursor-pointer text-sm font-semibold text-fg">Text version</summary>
                  <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted">
                    {system.nodes.map((node) => <li key={node.id}><strong className="text-fg">{node.label}</strong> ({node.type}): {node.role}</li>)}
                  </ul>
                </details>
              </section>
            );
          })}
        </>
      )}
    </div>
  );
}
