"use client";

import { useState } from "react";
import DraftBadge from "./DraftBadge";
import { trackEvent } from "@/lib/analytics";
import CaseStudyCard from "./CaseStudyCard";

type Item = { slug: string; title: string; impact: string; tags: string[]; categories: string[]; draft: boolean };
const FILTERS = ["All", "Production", "AI Features"] as const;

export default function WorkList({ items, basePath = "/work" }: { items: Item[]; basePath?: string }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const shown = filter === "All" ? items : items.filter((i) => i.categories.includes(filter));

  return (
    <div className="space-y-6">
      {/* Filter chips */}
      <div role="group" aria-label="Filter work" className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={filter === f}
            onClick={() => {
              setFilter(f);
              trackEvent("filter_change", { filter: f });
            }}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${
              filter === f
                ? "button-accent border-accent"
                : "border-line bg-card2 text-muted hover:border-accent hover:text-fg"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Work cards grid */}
      <div className="grid items-stretch gap-4 sm:grid-cols-2">
        {shown.map((item) => (
          <div key={item.slug} className="relative">
            {item.draft && <div className="pointer-events-none absolute right-3 top-3 z-10"><DraftBadge /></div>}
            <CaseStudyCard
              href={`${basePath}/${item.slug}`}
              title={item.title}
              status={item.draft ? "draft — awaiting approval" : "shipped"}
              summary={item.impact}
              tags={item.tags}
              index={items.findIndex((entry) => entry.slug === item.slug) + 1}
            />
          </div>
        ))}
      </div>

      {shown.length === 0 && (
        <div className="rounded-xl border border-line bg-card2 p-8 text-center">
          <p className="text-muted">No case studies match this filter.</p>
        </div>
      )}
    </div>
  );
}
