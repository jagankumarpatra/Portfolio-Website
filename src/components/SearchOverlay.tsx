"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { useOverlay } from "@/context/OverlayContext";
import type { SearchItem } from "@/lib/portfolio";

type Props = { items: SearchItem[] };

function score(item: SearchItem, query: string): number {
  const fields = [item.title, item.summary, ...item.tags].map((value) => value.toLowerCase());
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!terms.length) return 1;
  return terms.reduce((total, term) => {
    const match = fields.reduce((best, field, index) => {
      if (field === term) return Math.max(best, 10);
      if (field.startsWith(term)) return Math.max(best, index === 0 ? 8 : 5);
      if (field.includes(term)) return Math.max(best, index === 0 ? 6 : 3);
      let cursor = 0;
      let gaps = 0;
      for (const character of term) {
        const next = field.indexOf(character, cursor);
        if (next < 0) {
          cursor = -1;
          break;
        }
        if (cursor > 0) gaps += next - cursor;
        cursor = next + 1;
      }
      if (cursor > 0) return Math.max(best, Math.max(1, 4 - gaps * 0.1));
      return best;
    }, 0);
    return total + match;
  }, 0);
}

export default function SearchOverlay({ items }: Props) {
  const router = useRouter();
  const { overlay, closeOverlay, openOverlay } = useOverlay();
  const open = overlay === "search";
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const resultsRef = useRef<SearchItem[]>([]);
  const activeRef = useRef(active);
  const results = useMemo(
    () => items.map((item) => ({ item, score: score(item, query) }))
      .filter(({ score: value }) => value > 0)
      .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title))
      .slice(0, 10)
      .map(({ item }) => item),
    [items, query],
  );
  resultsRef.current = results;
  activeRef.current = active;

  useEffect(() => {
    if (!open) {
      previousFocus.current?.focus();
      previousFocus.current = null;
      return;
    }
    previousFocus.current ??= document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setQuery("");
    setActive(0);
    inputRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeOverlay();
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActive((current) => Math.min(current + 1, resultsRef.current.length - 1));
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActive((current) => Math.max(current - 1, 0));
      }
      if (event.key === "Enter" && resultsRef.current[activeRef.current]) {
        event.preventDefault();
        router.push(resultsRef.current[activeRef.current].href);
        closeOverlay();
      }
      if (event.key === "Tab") {
        const dialog = inputRef.current?.closest<HTMLElement>('[role="dialog"]');
        const focusables = dialog?.querySelectorAll<HTMLElement>('input:not([disabled]), button:not([disabled]), a[href]');
        if (!focusables?.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, closeOverlay, router]);

  useEffect(() => {
    const onSlash = (event: KeyboardEvent) => {
      const target = event.target;
      const editing = target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
      if (event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey && !editing) {
        event.preventDefault();
        openOverlay("search");
      }
    };
    window.addEventListener("keydown", onSlash);
    return () => window.removeEventListener("keydown", onSlash);
  }, [openOverlay]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center bg-black/70 px-4 pt-[12vh]" onMouseDown={(event) => {
      if (event.target === event.currentTarget) closeOverlay();
    }}>
      <section role="dialog" aria-modal="true" aria-label="Search portfolio" className="w-full max-w-2xl overflow-hidden rounded-xl border border-line bg-card shadow-2xl">
        <label className="flex items-center gap-3 border-b border-line px-4">
          <Search className="h-5 w-5 text-accent" aria-hidden="true" />
          <span className="sr-only">Search pages, projects, notes and skills</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => { setQuery(event.target.value); setActive(0); }}
            placeholder="Search projects, skills, notes..."
            className="min-h-14 min-w-0 flex-1 bg-transparent text-fg outline-none placeholder:text-muted"
            aria-controls="search-results"
            aria-activedescendant={results[active] ? `search-result-${results[active].id}` : undefined}
            role="combobox"
            aria-expanded="true"
            aria-autocomplete="list"
          />
          <button type="button" onClick={closeOverlay} aria-label="Close search" className="rounded-md p-2 text-muted hover:text-fg"><X className="h-4 w-4" /></button>
        </label>
        <ul id="search-results" role="listbox" className="max-h-[60vh] overflow-y-auto p-2">
          {results.length ? results.map((item, index) => (
            <li key={`${item.type}-${item.id}`} role="option" aria-selected={active === index} id={`search-result-${item.id}`}>
              <Link href={item.href} onClick={closeOverlay} onMouseEnter={() => setActive(index)} className={`block rounded-lg p-3 ${active === index ? "bg-card2" : "hover:bg-card2"}`}>
                <span className="flex items-center justify-between gap-3">
                  <span className="font-medium text-fg">{item.title}</span>
                  <span className="font-mono text-[11px] uppercase text-accent">{item.type}</span>
                </span>
                <span className="mt-1 block text-sm text-muted">{item.summary}</span>
              </Link>
            </li>
          )) : <li className="p-5 text-sm text-muted">No matching results.</li>}
        </ul>
        <p className="border-t border-line px-4 py-2 font-mono text-xs text-muted">↑↓ navigate · enter open · esc close</p>
      </section>
    </div>
  );
}
