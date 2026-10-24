import type { Metadata } from "next";
import Link from "next/link";
import { getCaseStudies } from "@/lib/content";
import { getSignalStats, getSkills } from "@/lib/portfolio";
import SectionHeading from "@/components/SectionHeading";

export const metadata: Metadata = {
  title: "Career Evidence",
  description: "Verified career metrics and the pages that provide their context.",
  alternates: { canonical: "/dashboard" },
  openGraph: { title: "Career Signal", description: "Verified career metrics and their supporting evidence.", type: "website" },
};

export default function DashboardPage() {
  const stats = getSignalStats();
  const skills = getSkills();
  const projects = getCaseStudies();
  return (
    <div className="editorial-page space-y-12">
      <header className="space-y-3">
        <p className="eyebrow">Evidence index</p>
        <h1 className="text-3xl font-semibold tracking-tight text-fg md:text-4xl">Career evidence</h1>
        <p className="max-w-2xl text-muted">Every number links to the page that provides its context. Estimates and unverified claims are not included.</p>
      </header>

      <section aria-label="Career metrics" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="flex min-h-36 flex-col rounded-lg border border-line bg-card p-5 hover:border-accent">
            <span className="font-mono text-3xl font-semibold tabular-nums text-fg">{stat.value}</span>
            <span className="mt-2 font-medium text-fg">{stat.label}</span>
            <span className="mt-auto pt-3 text-xs text-muted">Source · {stat.sublabel}</span>
          </Link>
        ))}
      </section>

      <section className="space-y-4">
        <SectionHeading>Skills in context</SectionHeading>
        <p className="text-sm text-muted">Select a skill to see its evidence and where it is used.</p>
        <div className="space-y-5">
          {[...new Set(skills.map((skill) => skill.category))].map((category) => (
            <div key={category} className="space-y-2">
              <h3 className="font-mono text-xs uppercase tracking-wider text-muted">{category}</h3>
              <div className="flex flex-wrap gap-2">
                {skills.filter((skill) => skill.category === category).map((skill) => (
                  <Link key={skill.id} href={`/skills#${skill.id}`} className="tag">{skill.name}</Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeading>Published case studies</SectionHeading>
        {projects.length ? (
          <ul className="divide-y divide-line rounded-xl border border-line bg-card">
            {projects.map((project) => (
              <li key={project.slug} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <Link href={`/projects/${project.slug}`} className="font-medium text-fg hover:text-accent">{project.title}</Link>
                <span className="rounded-full border border-line px-3 py-1 font-mono text-xs text-muted">{project.status === "draft" ? "draft · awaiting approval" : "shipped"}</span>
              </li>
            ))}
          </ul>
        ) : <p className="text-sm text-muted">No approved project status records are available.</p>}
      </section>
    </div>
  );
}
