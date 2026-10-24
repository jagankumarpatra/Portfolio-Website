"use client";

import { useState } from "react";
import { useOverlay } from "@/context/OverlayContext";

export default function AICompact({ suggestions, welcome }: { suggestions: string[]; welcome: string }) {
  const { openOverlay } = useOverlay();
  const [value, setValue] = useState("");
  const empty = value.trim().length === 0;

  return (
    <section id="ask" aria-labelledby="ai-compact-title" className="paper-surface p-5 md:p-6">
      <h2 id="ai-compact-title" className="text-base font-semibold text-fg">Ask about my work</h2>
      <p className="mt-1 text-sm text-muted">{welcome}</p>
      <form
        className="mt-4 flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          if (!empty) openOverlay("ai", value);
        }}
      >
        <label htmlFor="ai-compact-input" className="sr-only">Your question</label>
        <input
          id="ai-compact-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="e.g. What did the API project involve?"
          autoComplete="off"
          className="min-h-11 min-w-0 flex-1 rounded-md border border-line bg-bg px-3 py-2 text-sm text-fg placeholder:text-muted"
        />
        <button type="submit" disabled={empty} className="button-accent min-h-11 rounded-md px-5 py-2 text-sm font-semibold disabled:opacity-40">
          Ask
        </button>
      </form>
      {suggestions.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => openOverlay("ai", s)}
              className="min-h-9 rounded-md border border-line bg-bg px-3 py-1 text-left text-xs text-muted transition-colors hover:border-accent hover:text-fg"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
