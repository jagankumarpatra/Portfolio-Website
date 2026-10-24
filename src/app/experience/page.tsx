import type { Metadata } from "next";
import { getEducation, getMetrics, getRoles } from "@/lib/content";
import { Briefcase, GraduationCap, Calendar } from "lucide-react";

export const metadata: Metadata = {
  title: "Experience",
  description: "Backend experience at Runo and Invincix Solutions.",
  alternates: { canonical: "/experience" },
  openGraph: { title: "Engineering Experience", description: "Backend experience at Runo and Invincix Solutions.", type: "website" },
};

export default function ExperiencePage() {
  const roles = getRoles();
  const edu = getEducation();
  const m = getMetrics();
  return (
    <div className="mx-auto max-w-reading space-y-12">
      <div className="space-y-2">
        <p className="eyebrow">Work history</p>
        <h1 className="text-4xl font-semibold tracking-tight text-fg">Experience</h1>
        <p className="max-w-[68ch] text-muted">Backend delivery across public APIs, data workflows, integrations and production support.</p>
      </div>

      <section className="space-y-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-muted">
          <Briefcase className="h-4 w-4" /> Work
        </div>
        <div className="space-y-6">
          {roles.map((r, i) => {
            const id = r.company.toLowerCase().includes("runo") ? "runo" : "invincix";
            return (
            <div id={id} key={r.company} className="relative scroll-mt-24 rounded-lg border border-line bg-card p-6">
              {i === 0 && (
                <div className="absolute right-5 top-5 flex items-center gap-1.5">
                  <span className="badge badge-green text-xs">Current</span>
                </div>
              )}
              <div className="space-y-1 mb-4">
                <h2 className="text-lg font-semibold text-fg">{r.title}</h2>
                <p className="text-sm text-muted">{r.company}</p>
                <div className="flex items-center gap-2 font-mono text-sm text-muted">
                  <Calendar className="h-3.5 w-3.5" /> {r.period}
                </div>
              </div>
              <ul className="space-y-2.5">
                {r.bullets.map((b, j) => (
                  <li key={j} className="impact-bullet text-sm text-muted leading-relaxed">{b}</li>
                ))}
              </ul>
            </div>
          );})}
        </div>
      </section>

      <div className="section-divider" />

      <section className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-muted">
          <GraduationCap className="h-4 w-4" /> Education
        </div>
        <div className="rounded-lg border border-line bg-card p-6">
          <h2 className="text-lg font-semibold text-fg">{edu.degree}</h2>
          <p className="mt-1 text-muted">{edu.school}</p>
          <p className="mt-2 font-mono text-sm text-muted">{edu.period} · CGPA {m.cgpa}/{m.cgpa_scale}</p>
        </div>
      </section>
    </div>
  );
}
