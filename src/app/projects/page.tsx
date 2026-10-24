import type { Metadata } from "next";
import WorkList from "@/components/WorkList";
import { getCaseStudies } from "@/lib/content";

export const metadata: Metadata = {
  title: "Projects",
  description: "Backend project case studies, implementation details and verified outcomes.",
  alternates: { canonical: "/projects" },
  openGraph: { title: "Backend Engineering Projects", description: "Case studies, implementation details and verified outcomes.", type: "website" },
};

export default function ProjectsPage() {
  const items = getCaseStudies().map((project) => ({
    slug: project.slug,
    title: project.title,
    impact: project.impact,
    tags: project.tags,
    categories: project.categories,
    draft: project.status === "draft",
  }));

  return (
    <div className="editorial-page space-y-8">
      <header className="space-y-3">
        <p className="eyebrow">Selected work</p>
        <h1 className="text-4xl font-semibold tracking-tight text-fg">Case studies</h1>
        <p className="max-w-2xl text-muted">A record of backend work, with claims kept to the available evidence.</p>
      </header>
      {items.length ? <WorkList items={items} basePath="/projects" /> : <p className="rounded-xl border border-line bg-card p-6 text-muted">No case studies are approved for publication yet.</p>}
    </div>
  );
}
