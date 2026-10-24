import type { MetadataRoute } from "next";
import { getCaseStudies } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    "", "/projects", "/system-design", "/dashboard", "/about", "/experience",
    "/skills", "/education", "/credential/btech-computer-science", "/contact", "/cv",
  ];
  const cases = getCaseStudies().map((c) => `/projects/${c.slug}`);
  return [...pages, ...cases].map((p) => ({ url: `${SITE_URL}${p}` }));
}
