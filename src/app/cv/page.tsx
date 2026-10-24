import type { Metadata } from "next";
import TrackOnMount from "@/components/TrackOnMount";
import TrackedLink from "@/components/TrackedLink";
import { getSite } from "@/lib/content";

export const metadata: Metadata = {
  title: "CV",
  description: "Preview and download the résumé of a Backend Engineer.",
  alternates: { canonical: "/cv" },
};

export default function CvPage() {
  const site = getSite();
  return (
    <div className="space-y-6">
      <TrackOnMount event="cv_preview_open" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">CV</h1>
          <p className="mt-1 font-mono text-sm text-muted">Résumé last updated: {site.resumeUpdated}</p>
        </div>
        <TrackedLink
          href="/resume.pdf"
          download
          event="cv_download"
          className="rounded-lg bg-brand px-5 py-3 text-sm font-medium text-white hover:opacity-90"
        >
          Download résumé
        </TrackedLink>
      </div>
      <object data="/resume.pdf#view=FitH" type="application/pdf" aria-label="Résumé preview" className="h-[75vh] w-full rounded-lg border border-line bg-card">
        <p className="p-4">
          Your browser cannot preview PDFs. <a href="/resume.pdf" className="text-link underline">Open the résumé</a>.
        </p>
      </object>
    </div>
  );
}
