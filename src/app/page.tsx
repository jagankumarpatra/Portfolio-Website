import Link from "next/link";
import { ArrowRight, Download, Mail } from "lucide-react";
import AICompact from "@/components/AICompact";
import PersonJsonLd from "@/components/JsonLd";
import RequestFlow from "@/components/RequestFlow";
import TrackedLink from "@/components/TrackedLink";
import { getCaseStudies, getMetrics, getQA, getSite } from "@/lib/content";
import { buildMailto } from "@/lib/site";
import { getSkills } from "@/lib/portfolio";

export default function Home() {
  const site = getSite();
  const metrics = getMetrics();
  const featured = getCaseStudies()[0];
  const skills = getSkills().slice(0, 6);
  const suggestions = getQA()
    .filter((entry) => ["q08", "q15", "q06"].includes(entry.id))
    .map((entry) => entry.question);
  const { href: mailto } = buildMailto();

  return (
    <div className="editorial-page space-y-20 pb-8">
      <PersonJsonLd />

      <section className="grid gap-10 border-b border-line pb-12 pt-8 md:grid-cols-[minmax(0,1fr)_280px] md:items-end md:gap-14 md:pb-16 md:pt-14">
        <div className="space-y-6">
          <p className="eyebrow">{site.statusPill}</p>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight text-fg md:text-6xl">
              Backend systems, built for the path from idea to production.
            </h1>
            <p className="prose-copy text-lg text-muted">
              I&apos;m Jagan, a backend engineer working in Node.js, TypeScript and AWS.
              At Runo, my work spans public APIs, AI-assisted workflows, usage metering
              and production follow-through.
            </p>
            <p className="prose-copy text-base text-muted">
              I work from the request contract and data model through cross-repository
              implementation, QA and release fixes—not just the happy path.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 pt-1">
            {featured && (
              <Link href={`/projects/${featured.slug}`} className="button-accent inline-flex min-h-11 items-center gap-2 rounded-md px-5 py-3 text-sm font-semibold transition-opacity hover:opacity-90">
                Read the case study <ArrowRight className="h-4 w-4" />
              </Link>
            )}
            <TrackedLink href="/resume.pdf" download event="resume_download" className="inline-flex min-h-11 items-center gap-2 rounded-md border border-line bg-card px-4 py-3 text-sm font-medium text-fg hover:border-accent">
              <Download className="h-4 w-4" /> Résumé
            </TrackedLink>
            <TrackedLink href={mailto} event="contact_click" className="inline-flex min-h-11 items-center gap-2 px-3 py-3 text-sm font-medium text-muted hover:text-accent">
              <Mail className="h-4 w-4" /> Contact
            </TrackedLink>
          </div>
        </div>

        <aside aria-label="Evidence at a glance" className="paper-surface grid grid-cols-2 gap-px overflow-hidden bg-line md:grid-cols-1">
          <div className="bg-card p-5">
            <p className="font-mono text-3xl font-semibold tabular-nums text-fg">{metrics.prs_merged}</p>
            <p className="mt-1 text-sm font-medium text-fg">merged PRs counted</p>
            <p className="mt-1 text-xs leading-relaxed text-muted">Across {metrics.repositories} repositories · release promotions excluded</p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted">Local merge history · mostly my commits</p>
          </div>
          <div className="bg-card p-5">
            <p className="font-mono text-3xl font-semibold tabular-nums text-fg">{metrics.prs_ai_api}</p>
            <p className="mt-1 text-sm font-medium text-fg">PRs on the featured API</p>
            <p className="mt-1 text-xs leading-relaxed text-muted">Across {metrics.repositories_ai_api} repositories</p>
          </div>
        </aside>
      </section>

      {featured && (
        <section aria-labelledby="featured-work" className="space-y-7">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-2">
              <p className="eyebrow">Selected case study · production</p>
              <h2 id="featured-work" className="max-w-3xl text-3xl font-semibold tracking-tight text-fg md:text-4xl">{featured.title}</h2>
            </div>
            <p className="font-mono text-sm text-muted">{featured.timeline}</p>
          </div>
          <p className="prose-copy text-lg text-muted">{featured.impact}</p>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-start">
            <div className="space-y-5">
              <div className="paper-surface p-5 md:p-7">
                <p className="eyebrow mb-5">Request flow · verified scope</p>
                <RequestFlow />
              </div>
              <p className="prose-copy text-sm leading-relaxed text-muted">{featured.role}</p>
              <Link href={`/projects/${featured.slug}`} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-accent hover:underline">
                Read the decisions, trade-offs and release notes <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <aside className="decision-note rounded-r-md p-5">
              <p className="eyebrow">Scope decision</p>
              <p className="mt-2 text-sm leading-relaxed text-fg">
                The first release used secure recording links and a synchronous start flow. File upload and an asynchronous worker were deliberately left out of scope.
              </p>
            </aside>
          </div>
        </section>
      )}

      <section aria-labelledby="working-stack" className="grid gap-5 border-y border-line py-7 md:grid-cols-[180px_1fr] md:items-start">
        <h2 id="working-stack" className="eyebrow pt-1">Tools in the work</h2>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => <Link href={`/skills#${skill.id}`} key={skill.id} className="tag">{skill.name}</Link>)}
          <Link href="/skills" className="inline-flex min-h-9 items-center gap-1 px-2 text-sm font-medium text-accent hover:underline">
            Browse skills <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      <section aria-labelledby="portfolio-qa" className="grid gap-7 md:grid-cols-[minmax(0,0.75fr)_minmax(0,1fr)] md:items-start">
        <div className="space-y-3">
          <p className="eyebrow">Grounded portfolio Q&amp;A</p>
          <h2 id="portfolio-qa" className="text-3xl font-semibold tracking-tight text-fg">Have a specific question?</h2>
          <p className="prose-copy text-muted">
            Answers are matched from published project and profile notes. If a detail is not documented, the tool says so rather than guessing.
          </p>
        </div>
        <AICompact suggestions={suggestions} welcome={site.aiWelcome} />
      </section>
    </div>
  );
}
