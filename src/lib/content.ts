import { z } from "zod";
import metricsJson from "../../content/metrics.json";
import siteJson from "../../content/site.json";
import experienceJson from "../../content/experience.json";
import caseStudiesJson from "../../content/case-studies.json";
import architectureJson from "../../content/architecture.json";
import qaJson from "../../content/qa.json";

/* ---------- visibility ---------- */
export function showDrafts(): boolean {
  return process.env.NODE_ENV !== "production" || process.env.SHOW_DRAFTS === "true";
}

/* ---------- metrics and tokens ---------- */
const metrics = z.record(z.string(), z.string()).parse(metricsJson);

const TOKEN = /\{\{\s*([a-z0-9_]+)\s*\}\}/gi;

export function t(text: string): string {
  return text.replace(TOKEN, (_m, key: string) => {
    const value = metrics[key];
    if (value === undefined) throw new Error(`Unknown metric token: {{${key}}}`);
    return value;
  });
}

function resolve<T>(value: T): T {
  if (typeof value === "string") return t(value) as unknown as T;
  if (Array.isArray(value)) return value.map((v) => resolve(v)) as unknown as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, resolve(v)]),
    ) as T;
  }
  return value;
}

/* ---------- schemas ---------- */
const Status = z.enum(["approved", "draft"]);
const Tag = z.enum(["L", "CV", "INF"]);
const Gate = {
  status: Status,
  evidenceTag: Tag,
  approvedOn: z.string().optional(),
};
function gated<T extends z.ZodTypeAny>(schema: T) {
  return schema.superRefine((val, ctx) => {
    const v = val as { status: string; evidenceTag: string; approvedOn?: string };
    if (v.status === "approved" && (!v.approvedOn || v.evidenceTag === "INF")) {
      ctx.addIssue({ code: "custom", message: "Approved items need approvedOn and a non-INF evidenceTag" });
    }
  });
}

const Site = z.object({
  name: z.string(), email: z.string(), phone: z.string(), linkedin: z.string(), github: z.string(),
  statusPill: z.string(), headline: z.string(), impactLine: z.string(), homeTitle: z.string(),
  metaDescription: z.string(), mailtoSubject: z.string(), mailtoBody: z.string(),
  footerLine: z.string(), footerCopy: z.string(), resumeUpdated: z.string(),
  notFoundTitle: z.string(), aiFallback: z.string(), aiWelcome: z.string(),
});

const Role = gated(z.object({
  company: z.string(), title: z.string(), period: z.string(), bullets: z.array(z.string()).min(1), ...Gate,
}));
const Experience = z.object({
  roles: z.array(Role),
  education: z.object({ degree: z.string(), school: z.string(), period: z.string(), note: z.string() }),
});

const CaseStudy = gated(z.object({
  slug: z.string(), title: z.string(), impact: z.string(),
  tags: z.array(z.string()).min(1), categories: z.array(z.enum(["Production", "AI Features"])).min(1),
  role: z.string().optional(), timeline: z.string().optional(),
  decisions: z.array(z.object({ label: z.string(), detail: z.string() })).optional(),
  challenge: z.array(z.string()).min(1), approach: z.array(z.string()).min(1),
  impact_points: z.array(z.string()).min(1), lessons: z.array(z.string()),
  nodeId: z.string().nullable(), needsInput: z.array(z.string()).optional(), ...Gate,
})).superRefine((v, ctx) => {
  if (v.status === "approved" && v.lessons.length === 0) {
    ctx.addIssue({ code: "custom", message: `Case study ${v.slug} cannot be approved without lessons` });
  }
});

const ArchNode = gated(z.object({
  id: z.string(), label: z.string(),
  type: z.enum(["service", "queue", "db", "storage", "observability", "external", "client"]),
  x: z.number(), y: z.number(), role: z.string(),
  scaleNote: z.string().optional(), failureMode: z.string().optional(), howIWouldBuildToday: z.string().optional(),
  ...Gate,
}));
const System = gated(z.object({
  id: z.string(), title: z.string(), caseStudySlug: z.string().optional(),
  nodes: z.array(ArchNode).min(1), edges: z.array(z.tuple([z.string(), z.string()])),
  needsInput: z.array(z.string()).optional(), ...Gate,
}));

const QA = gated(z.object({
  id: z.string(), question: z.string(), keywords: z.array(z.string()).min(1), answer: z.string(),
  source: z.object({ type: z.enum(["page", "case", "node"]), ref: z.string() }),
  followUps: z.array(z.string()).length(2), ...Gate,
}));

/* ---------- parsed data ---------- */
const site = resolve(Site.parse(siteJson));
const experience = resolve(Experience.parse(experienceJson));
const caseStudiesAll = resolve(z.object({ items: z.array(CaseStudy) }).parse(caseStudiesJson).items);
const systemsAll = resolve(z.object({ systems: z.array(System) }).parse(architectureJson).systems);
const qaAll = resolve(z.object({ items: z.array(QA) }).parse(qaJson).items);

const visible = <T extends { status: string }>(items: T[]): T[] =>
  showDrafts() ? items : items.filter((i) => i.status === "approved");

export type CaseStudyT = (typeof caseStudiesAll)[number];
export type SystemT = (typeof systemsAll)[number];
export type NodeT = SystemT["nodes"][number];
export type RoleT = (typeof experience.roles)[number];

export const getSite = () => site;
export const getMetrics = () => metrics;
export const getEducation = () => experience.education;
export const getRoles = () => visible(experience.roles);
export const getCaseStudies = () => visible(caseStudiesAll);
export const getCaseStudy = (slug: string) => getCaseStudies().find((c) => c.slug === slug);
export const getSystems = () =>
  visible(systemsAll)
    .map((s) => ({ ...s, nodes: visible(s.nodes) }))
    .filter((s) => s.nodes.length > 0)
    .map((s) => {
      const ids = new Set(s.nodes.map((n) => n.id));
      return { ...s, edges: s.edges.filter(([a, b]) => ids.has(a) && ids.has(b)) };
    });

export type QAClient = {
  id: string; question: string; keywords: string[]; answer: string;
  followUps: string[]; href: string; sourceLabel: string; draft: boolean;
};

export function getQA(): QAClient[] {
  const cases = getCaseStudies();
  const systems = getSystems();
  const pageLabels: Record<string, string> = {
    experience: "Experience", cv: "CV", about: "About", contact: "Contact",
  };
  const entries = visible(qaAll).flatMap((e) => {
    const { type, ref } = e.source;
    if (type === "case") {
      const c = cases.find((x) => x.slug === ref);
      if (!c) return [];
      return [{ e, href: `/projects/${ref}`, sourceLabel: c.title }];
    }
    if (type === "node") {
      const owner = systems.find((s) => s.nodes.some((n) => n.id === ref));
      if (!owner) return [];
      const node = owner.nodes.find((n) => n.id === ref)!;
      return [{ e, href: `/system-design?node=${ref}`, sourceLabel: `${owner.title}: ${node.label}` }];
    }
    return [{ e, href: `/${ref}`, sourceLabel: pageLabels[ref] ?? ref }];
  });
  const ids = entries.map((x) => x.e.id);
  return entries.map(({ e, href, sourceLabel }) => {
    const valid = e.followUps.filter((f) => ids.includes(f) && f !== e.id);
    const pad = ids.filter((i) => i !== e.id && !valid.includes(i));
    const picked = [...valid, ...pad].slice(0, 2);
    return {
      id: e.id, question: e.question, keywords: e.keywords, answer: e.answer,
      followUps: picked, href, sourceLabel, draft: e.status === "draft",
    };
  });
}
