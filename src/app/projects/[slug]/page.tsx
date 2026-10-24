import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectDetailContent from "@/components/ProjectDetailContent";
import { getCaseStudies, getCaseStudy } from "@/lib/content";

type Params = Promise<{ slug: string }>;
export const dynamicParams = false;

export function generateStaticParams() {
  return getCaseStudies().map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const project = getCaseStudy(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.impact,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: { title: project.title, description: project.impact, type: "article" },
  };
}

export default async function ProjectPage({ params }: { params: Params }) {
  const { slug } = await params;
  if (!getCaseStudy(slug)) notFound();
  return <ProjectDetailContent slug={slug} />;
}
