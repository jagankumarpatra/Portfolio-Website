import { getSite } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

export default function PersonJsonLd() {
  const site = getSite();
  const data = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    jobTitle: "Backend Engineer",
    url: SITE_URL,
    sameAs: [site.linkedin, site.github],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
