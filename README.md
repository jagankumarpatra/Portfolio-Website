# Jagan Kumar Patra — Engineering Field Notes

A case-study-led portfolio for backend and platform engineering work. The site focuses on
published evidence, implementation decisions, and a verified request-flow diagram rather than
simulated terminal output.

## Stack

- Next.js 15 App Router, React 19, and TypeScript
- Tailwind CSS
- React Flow for the optional interactive architecture explorer
- Local JSON files for profile, project, metrics, and portfolio Q&A content

The portfolio Q&A is deterministic: it matches questions against reviewed content and does not
generate or guess answers.

## Run locally

Requirements: Node.js 20 or newer.

```sh
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Copy `.env.example` to `.env.local` to
override local environment settings.

## Validate and build

```sh
npm run check       # TypeScript, ESLint, content validation, and tests
npm run build       # Production build; draft content stays unpublished
npm start           # Serve the production build
npm run preview     # Build and serve with draft content for private review
```

Do not deploy with `SHOW_DRAFTS=true`. Production builds publish approved content only.

## Content

Portfolio copy and structured data live in `content/`. Numeric claims are checked against
`content/metrics.json`; `npm run check:content` validates publication status and content rules.
Draft case studies require review and approval before they appear in production.

`content/denylist.txt` is a local-only file for names that must not appear in published content.
It is intentionally ignored by Git. The source PRD and audit PDF are also excluded from this
repository.

## Deploy

Import this repository into Vercel and keep the framework preset as **Next.js**. Set
`NEXT_PUBLIC_SITE_URL` to the production URL in the Vercel project environment variables.
`SHOW_DRAFTS` should be unset or set to `false`. Every production deployment runs the normal
Next.js build and publishes approved content only.
