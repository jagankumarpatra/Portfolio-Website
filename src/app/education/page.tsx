import type { Metadata } from "next";
import Link from "next/link";
import { getEducation, getMetrics } from "@/lib/content";

export const metadata: Metadata = {
  title: "Education",
  description: "Computer Science education and academic record.",
  alternates: { canonical: "/education" },
  openGraph: { title: "Education", description: "Computer Science education and academic record.", type: "website" },
};

export default function EducationPage() {
  const education = getEducation();
  const metrics = getMetrics();
  return (
    <div className="mx-auto max-w-reading space-y-8">
      <header className="space-y-3">
        <p className="eyebrow">Education</p>
        <h1 className="text-4xl font-semibold tracking-tight text-fg">Education</h1>
        <p className="text-muted">Academic background, with the source details currently available.</p>
      </header>
      <article className="rounded-lg border border-line bg-card p-6">
        <h2 className="mt-4 text-xl font-semibold text-fg">{education.degree}</h2>
        <p className="mt-2 text-muted">{education.school}</p>
        <p className="mt-4 text-sm text-muted">{education.period}</p>
        <p className="mt-2 text-sm text-muted">CGPA {metrics.cgpa}/{metrics.cgpa_scale}</p>
        <Link href="/credential/btech-computer-science" className="mt-5 inline-flex min-h-11 items-center text-sm font-medium text-accent hover:underline">Academic record</Link>
      </article>
      <Link href="/certifications" className="text-sm text-accent underline-offset-4 hover:underline">View certifications</Link>
    </div>
  );
}
