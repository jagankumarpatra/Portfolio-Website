"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Bot, Send, X } from "lucide-react";
import { useOverlay } from "@/context/OverlayContext";
import { answerQuestion, normalize, sanitize, type QAEntry, type QAResult } from "@/lib/qa";
import { trackEvent } from "@/lib/analytics";

type Message =
  | { role: "user"; text: string }
  | { role: "bot"; text: string; entry?: QAEntry; note?: string };

type Props = { entries: QAEntry[]; fallback: string; welcome: string };

export default function AIOverlay({ entries, fallback, welcome }: Props) {
  const { overlay, closeOverlay, pendingQuery, clearPendingQuery } = useOverlay();
  const open = overlay === "ai";
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const cache = useRef(new Map<string, QAResult>());
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);

  const ask = useCallback(
    (raw: string) => {
      const { text } = sanitize(raw);
      if (!text) return;
      const key = normalize(text).join(" ") || text.toLowerCase();
      let result = cache.current.get(key);
      if (!result) {
        result = answerQuestion(text, entries);
        cache.current.set(key, result);
      }
      const { shortened } = sanitize(raw);
      trackEvent("ai_query", { matched: result.matched });
      setMessages((prev) => [
        ...prev,
        { role: "user", text },
        {
          role: "bot",
          text: result.entry?.answer ?? result.reply ?? fallback,
          entry: result.entry,
          note: shortened ? "Question shortened" : undefined,
        },
      ]);
      setInput("");
    },
    [entries, fallback],
  );

  // Focus handling, scroll lock, Escape and focus trap.
  useEffect(() => {
    if (!open) return;
    lastFocused.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeOverlay();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      lastFocused.current?.focus?.();
    };
  }, [open, closeOverlay]);

  // A question typed into the compact box on Home is answered when the modal opens.
  useEffect(() => {
    if (open && pendingQuery) {
      ask(pendingQuery);
      clearPendingQuery();
    }
  }, [open, pendingQuery, ask, clearPendingQuery]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [messages]);

  if (!open) return null;

  const byId = new Map(entries.map((e) => [e.id, e]));
  const empty = input.trim().length === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-fg/45 p-0 sm:items-center sm:p-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-title"
        className="motion-safe:animate-fade-up flex max-h-[90vh] w-full max-w-xl flex-col rounded-t-xl border border-line bg-bg text-fg shadow-2xl sm:rounded-xl"
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <h2 id="ai-title" className="flex items-center gap-2 text-base font-semibold">
            <Bot className="h-5 w-5 text-accent" aria-hidden="true" /> Portfolio Q&amp;A
          </h2>
          <button type="button" onClick={closeOverlay} aria-label="Close" className="rounded-md p-1 text-muted hover:text-fg">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div ref={logRef} className="min-h-[160px] flex-1 space-y-3 overflow-y-auto px-4 py-4 text-sm" aria-live="polite">
          <p className="rounded-md border border-line bg-card p-3 text-muted">{welcome}</p>
          {messages.map((m, i) =>
            m.role === "user" ? (
              <p key={i} className="button-accent ml-8 rounded-md p-3">{m.text}</p>
            ) : (
              <div key={i} className="mr-8 space-y-2 rounded-md border border-line bg-card p-3">
                {m.note && <p className="text-xs text-muted">{m.note}</p>}
                <p>{m.text}</p>
                {m.entry && (
                  <p className="text-xs text-muted">
                    Source:{" "}
                    <Link href={m.entry.href} onClick={closeOverlay} className="text-link underline">
                      {m.entry.sourceLabel}
                    </Link>
                  </p>
                )}
                {m.entry && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {[...new Set(m.entry.followUps)].map((id) => {
                      const f = byId.get(id);
                      return f ? (
                        <button
                          key={id}
                          type="button"
                          onClick={() => ask(f.question)}
                          className="min-h-9 rounded-md border border-line px-3 py-1 text-left text-xs text-fg hover:border-accent"
                        >
                          {f.question}
                        </button>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            ),
          )}
        </div>

        <form
          className="border-t border-line p-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!empty) ask(input);
          }}
        >
          <div className="flex flex-col gap-2 sm:flex-row">
            <label htmlFor="ai-input" className="sr-only">Your question</label>
            <input
              id="ai-input"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              aria-describedby="ai-helper"
              placeholder="Ask about a project, decision or skill"
              autoComplete="off"
              className="min-h-11 min-w-0 flex-1 rounded-md border border-line bg-card px-3 py-2 text-sm text-fg placeholder:text-muted"
            />
            <button
              type="submit"
              disabled={empty}
              className="button-accent flex min-h-11 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold disabled:opacity-40"
            >
              <Send className="h-4 w-4" aria-hidden="true" /> Send
            </button>
          </div>
          <p id="ai-helper" className="mt-2 text-xs text-muted">
            {empty ? "Type a question to enable Send." : "Press Enter to send."}
          </p>
        </form>
      </div>
    </div>
  );
}
