import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import DraftBadge from "@/components/DraftBadge";
import RequestFlow from "@/components/RequestFlow";
import TrackOnMount from "@/components/TrackOnMount";
import { getCaseStudies, getCaseStudy, getSystems, showDrafts } from "@/lib/content";
import { getSkills } from "@/lib/portfolio";
import SectionHeading from "@/components/SectionHeading";

export default function ProjectDetailContent({ slug }: { slug: string }) {
  const project = getCaseStudy(slug);
  if (!project) notFound();

  const allProjects = getCaseStudies();
  const index = allProjects.findIndex((item) => item.slug === project.slug);
  const previous = allProjects[index - 1];
  const next = allProjects[index + 1];
  const nodeVisible = project.nodeId
    ? getSystems().some((system) => system.nodes.some((node) => node.id === project.nodeId))
    : false;
  const skills = getSkills();
  const tagSkills: Record<string, string> = {
    "Public API": "rest-apis",
    "Permissions": "rbac",
    "RBAC": "rbac",
  };

  return (
    <article className="reading-column mx-auto space-y-12 pb-8">
      <TrackOnMount event="project_open" props={{ slug: project.slug }} />
      <Link href="/projects" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted hover:text-accent">
        <ArrowLeft className="h-4 w-4" /> All case studies
      </Link>

      <header className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-accent/40 px-3 py-1 text-xs font-semibold text-accent">
            {project.status === "draft" ? "Draft · review required" : "Released to production"}
          </span>
          {project.status === "draft" && <DraftBadge note={project.needsInput?.join("; ")} />}
        </div>
        <div className="space-y-4">
          <p className="eyebrow">{project.timeline ?? "Engineering case study"}</p>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-fg md:text-5xl">{project.title}</h1>
          <p className="prose-copy text-lg leading-relaxed text-muted">{project.impact}</p>
        </div>
        <ul className="flex flex-wrap gap-2" aria-label="Project technologies and topics">
          {project.tags.map((tag) => {
            const matchingSkill = skills.find((skill) => skill.id === tagSkills[tag] || skill.name.toLowerCase() === tag.toLowerCase());
            return (
              <li key={tag}>
                {matchingSkill
                  ? <Link className="tag" href={`/skills#${matchingSkill.id}`}>{tag}</Link>
                  : <span className="tag">{tag}</span>}
              </li>
            );
          })}
        </ul>
        {project.role && (
          <div className="paper-surface p-5">
            <p className="eyebrow">My role</p>
            <p className="mt-2 max-w-[68ch] text-sm leading-relaxed text-fg">{project.role}</p>
          </div>
        )}
        <div className="flex flex-wrap gap-3">
          {nodeVisible && (
            <Link href={`/system-design?node=${project.nodeId}`} className="inline-flex min-h-11 items-center gap-2 rounded-md border border-line px-4 py-2 text-sm font-medium text-fg hover:border-accent">
              Explore the request flow <ExternalLink className="h-4 w-4" />
            </Link>
          )}
          <Link href="/contact" className="button-accent inline-flex min-h-11 items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold hover:opacity-90">
            Contact
          </Link>
        </div>
      </header>

      {project.slug === "ai-call-analysis-public-api" && (
        <section aria-labelledby="request-flow-heading" className="space-y-4">
          <h2 id="request-flow-heading" className="text-xl font-semibold tracking-tight text-fg">Request flow</h2>
          <p className="prose-copy text-sm text-muted">
            The documented interface flow, not an inferred infrastructure diagram. The initial scope kept file uploads and a background worker out.
          </p>
          <div className="paper-surface p-4 md:p-6"><RequestFlow /></div>
        </section>
      )}

      <section className="space-y-4">
        <SectionHeading>The problem</SectionHeading>
        {project.challenge.map((paragraph, i) => <p key={i} className="prose-copy text-muted">{paragraph}</p>)}
      </section>

      {project.decisions && project.decisions.length > 0 && (
        <section className="space-y-5">
          <SectionHeading>Decisions and trade-offs</SectionHeading>
          <div className="grid gap-3">
            {project.decisions.map((decision) => (
              <article key={decision.label} className="decision-note rounded-r-md p-5">
                <h3 className="font-semibold text-fg">{decision.label}</h3>
                <p className="prose-copy mt-2 text-sm text-muted">{decision.detail}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <SectionHeading>Implementation</SectionHeading>
        <ul className="space-y-3">
          {project.approach.map((item, i) => <li key={i} className="impact-bullet max-w-[68ch] leading-relaxed text-muted">{item}</li>)}
        </ul>
      </section>

      <section className="space-y-4">
        <SectionHeading>Outcome and evidence</SectionHeading>
        <ul className="space-y-3">
          {project.impact_points.map((item, i) => <li key={i} className="impact-bullet max-w-[68ch] leading-relaxed text-muted">{item}</li>)}
        </ul>
      </section>

      {project.lessons.length > 0 && (
        <section className="paper-surface space-y-4 p-5 md:p-6">
          <SectionHeading>What the work reinforced</SectionHeading>
          <ul className="space-y-3">
            {project.lessons.map((item, i) => <li key={i} className="impact-bullet max-w-[68ch] leading-relaxed text-muted">{item}</li>)}
          </ul>
        </section>
      )}

      {showDrafts() && project.status === "draft" && project.lessons.length === 0 && (
        <section className="rounded-lg border border-dashed border-signal/60 bg-signal/5 p-5">
          <SectionHeading>Owner review needed</SectionHeading>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            This draft stays unpublished until its role, decisions, trade-offs and lessons are reviewed.
          </p>
        </section>
      )}

      <nav aria-label="Other projects" className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
        {previous ? <Link href={`/projects/${previous.slug}`} className="inline-flex min-h-11 items-center gap-2 text-sm text-muted hover:text-accent"><ArrowLeft className="h-4 w-4" /> {previous.title}</Link> : <span />}
        {next ? <Link href={`/projects/${next.slug}`} className="inline-flex min-h-11 items-center gap-2 text-sm text-muted hover:text-accent">{next.title} <ArrowRight className="h-4 w-4" /></Link> : <Link href="/projects" className="text-sm font-medium text-accent hover:underline">All case studies</Link>}
      </nav>
    </article>
  );
}
