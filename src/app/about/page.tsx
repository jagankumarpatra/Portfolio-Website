import type { Metadata } from "next";
import Link from "next/link";
import PersonJsonLd from "@/components/JsonLd";
import { getEducation, getMetrics, getRoles, getSite } from "@/lib/content";
import { MapPin, Code2, BookOpen, ArrowRight } from "lucide-react";
import { getSignalStats } from "@/lib/portfolio";

export const metadata: Metadata = {
  title: "About",
  description: "Backend Engineer in Hyderabad building production systems at scale.",
  alternates: { canonical: "/about" },
  openGraph: { title: "About Jagan Kumar Patra", description: "Background, focus and education.", type: "website" },
};

export default function AboutPage() {
  const site = getSite();
  const m = getMetrics();
  const roles = getRoles();
  const edu = getEducation();
  const stats = getSignalStats().slice(0, 2);
  return (
    <div className="mx-auto max-w-reading space-y-10">
      <PersonJsonLd />

      <div className="space-y-4">
        <p className="eyebrow">Profile</p>
        <h1 className="text-4xl font-semibold tracking-tight text-fg">About</h1>
        <div className="flex items-center gap-2 text-sm text-muted">
          <MapPin className="h-4 w-4 text-accent" />
          <span>Hyderabad, India · Available for Remote</span>
        </div>
      </div>

      <div className="paper-surface space-y-4 p-6">
        <p className="text-fg leading-relaxed">
          I&apos;m <strong className="text-fg">{site.name}</strong>, a Backend Engineer with{" "}
          <span className="text-accent font-medium">{m.years} years</span> of experience building production systems.
          I work primarily with Node.js, TypeScript and AWS.
        </p>
        <p className="text-muted leading-relaxed text-sm">
          The Runo work record counts {m.prs_merged} merged pull requests across {m.repositories} repositories from
          December 2025 to October 2026. The featured case study follows one API from request-contract decisions
          through QA, production and follow-up fixes.
        </p>
      </div>

      <section aria-label="Profile metrics" className="grid gap-3 sm:grid-cols-3">
        {stats.map((stat) => (
          <Link href={stat.href} key={stat.label} className="rounded-lg border border-line bg-card p-4 hover:border-accent">
            <p className="font-mono text-2xl font-semibold text-fg">{stat.value}</p>
            <p className="mt-1 text-sm text-fg">{stat.label}</p>
          </Link>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-mono text-muted uppercase tracking-widest">
          <Code2 className="h-4 w-4" /> Roles
        </h2>
        <ul className="space-y-2">
          {roles.map((r) => (
            <li key={r.company} className="flex flex-wrap items-baseline justify-between gap-2 rounded-md border border-line bg-card px-4 py-3">
              <strong className="text-fg text-sm">{r.title}</strong>
              <span className="font-mono text-xs text-muted">{r.period}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-mono text-muted uppercase tracking-widest">
          <BookOpen className="h-4 w-4" /> Education
        </h2>
        <Link href="/education" className="block rounded-md border border-line bg-card px-4 py-3 hover:border-accent">
          <p className="text-fg text-sm font-medium">{edu.degree}, {edu.school}</p>
          <p className="font-mono text-xs text-muted mt-1">{edu.period} · CGPA {m.cgpa}/{m.cgpa_scale}</p>
        </Link>
      </section>

      <div className="flex items-center gap-2 text-sm text-muted">
        <span className="text-fg font-medium">{m.leetcode_java}</span> LeetCode problems solved in Java.
      </div>

      <div className="rounded-xl border border-brand/30 bg-brand/5 p-5">
        <p className="font-medium text-fg text-sm">{site.statusPill}</p>
        <div className="mt-3 flex flex-wrap gap-4">
          <Link href="/contact" className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline">Get in touch <ArrowRight className="h-3.5 w-3.5" /></Link>
          <Link href="/skills" className="text-sm text-accent hover:underline">Skills</Link>
          <Link href="/certifications" className="text-sm text-accent hover:underline">Certifications</Link>
        </div>
      </div>
    </div>
  );
}
