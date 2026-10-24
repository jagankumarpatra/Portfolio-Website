import { notFound, permanentRedirect } from "next/navigation";
import { getCaseStudy } from "@/lib/content";

type Params = Promise<{ slug: string }>;

export default async function LegacyCaseStudyPage({ params }: { params: Params }) {
  const { slug } = await params;
  if (!getCaseStudy(slug)) notFound();
  permanentRedirect(`/projects/${slug}`);
}
