# DECISIONS.md

Rulebook: PRD C Final Rulebook v3. Every decision below was made by the implementer. Items marked NEEDS APPROVAL deviate from or extend a locked rule.

## Versions (installed and pinned, checked on 18 Oct 2026)
- next 15.5.28, react / react-dom 19.2.1 (patched for CVE-2025-55182; the previous 15.1.0 / 19.0.0 were affected)
- tailwindcss 3.4.19, typescript 5.9.3, eslint 9.39.5, eslint-config-next 15.5.28
- zod 4.6.7, @xyflow/react 12.12.0, @vercel/analytics 2.0.1, lucide-react 1.59.0
- vitest 5.0.5, jsdom, Testing Library (tests only)
- `npm audit` still reports advisories in PostCSS bundled inside Next 15.x, and in dev-only tooling (tailwind, eslint-config-next). The PostCSS ones concern processing untrusted CSS, which this site never does. Fixing them means Next 16, which the rulebook does not allow. Revisit when moving to Next 16.

## Decided
- **Fonts:** self-hosted with `next/font/local` from @fontsource-variable (Inter, JetBrains Mono, latin subset, display swap). No requests to Google at build or run time.
- **Content storage:** JSON files in `/content`, validated by Zod at build and run time, plus `scripts/check-content.mjs`.
- **Draft gating:** every content item has `status`, `evidenceTag`, `approvedOn`. Production builds render only `approved` items. Development, and builds with `SHOW_DRAFTS=true`, also render drafts with a DRAFT badge.
- **Metrics:** copy uses `{{token}}` placeholders resolved from `content/metrics.json`. Unknown tokens throw. The content check fails on any number in content that is not in the metrics file.
- **Overlay state:** one `overlay` state (none, menu, ai, node). The floating AI button renders only when it is none. The node bottom sheet sets it only below 768px.
- **Q&A matching:** lowercase, strip punctuation, drop stopwords, light plural stemming, match at 2 or more keyword hits (1 for single-keyword entries), best hits then ratio then lower id. Repeated questions return a cached result.
- **Explorer:** nodes use hand-set coordinates. The graph is uncontrolled React Flow with a stable selection handler. Closing the details remounts the graph so no stale selection survives (this fixed a bug where the mobile sheet reopened itself).
- **Tests:** 30 jsdom tests cover the Q&A matcher, AI overlay, floating button, header menu, work filters, copy buttons, static diagram, explorer logic and draft gating.

## NEEDS APPROVAL
- **Case studies are JSON, not MDX.** The stack says MDX. Structured JSON with the same seven sections is easier to validate and has fewer dependencies. Switching to MDX later is possible.
- **Edges in both architecture diagrams are inferred ordering.** The ledger lists the steps, not their order, so both systems stay `draft` until Jagan confirms the flow.
- **Lessons** are missing in all three case studies by design. Schema and check refuse to approve a case study without them.

## Not built
- /process and the DigiKhata case study (excluded by the rulebook until approved).
- Keyword-coverage widget on /cv (deferred, `SHOW_CV_SCORE` not implemented).
- Gemini assistant (v1.1).
