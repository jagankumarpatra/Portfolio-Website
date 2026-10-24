import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEducation, getMetrics } from "@/lib/content";

type Params = Promise<{ id: string }>;
const credentialId = "btech-computer-science";
export const dynamicParams = false;

export function generateStaticParams() {
  return [{ id: credentialId }];
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  if (id !== credentialId) return {};
  const education = getEducation();
  return {
    title: education.degree,
    description: `${education.degree} at ${education.school}.`,
    alternates: { canonical: `/credential/${credentialId}` },
    openGraph: { title: education.degree, description: education.school, type: "article" },
  };
}

export default async function CredentialPage({ params }: { params: Params }) {
  const { id } = await params;
  if (id !== credentialId) notFound();
  const education = getEducation();
  const metrics = getMetrics();
  return (
    <article className="reading-column mx-auto space-y-8">
      <Link href="/education" className="inline-flex min-h-11 items-center text-sm text-muted hover:text-accent">← Education</Link>
      <header className="space-y-4">
        <p className="eyebrow">Academic record</p>
        <h1 className="text-3xl font-semibold tracking-tight text-fg md:text-4xl">{education.degree}</h1>
        <p className="text-lg text-muted">{education.school}</p>
        <p className="text-sm text-muted">{education.period} · completed</p>
      </header>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-fg">Record</h2>
        <p className="leading-relaxed text-muted">The published academic record lists a CGPA of {metrics.cgpa}/{metrics.cgpa_scale}. No certificate image or additional course details are included because none are available in the source content.</p>
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-fg">Related work</h2>
        <p><Link href="/experience" className="text-accent underline-offset-4 hover:underline">Backend engineering experience</Link></p>
        <p><Link href="/skills" className="text-accent underline-offset-4 hover:underline">Skills and evidence</Link></p>
      </section>
    </article>
  );
}
