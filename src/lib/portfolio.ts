import { getCaseStudies, getEducation, getMetrics, getRoles, getSite, showDrafts } from "@/lib/content";

export type SearchItem = {
  id: string;
  type: "page" | "project" | "note" | "skill" | "credential";
  title: string;
  summary: string;
  tags: string[];
  href: string;
};

export type Skill = {
  id: string;
  name: string;
  category: string;
  usedIn: { label: string; href: string }[];
};

export type PlaybookNote = {
  slug: string;
  title: string;
  blurb: string;
  thesis: string;
  tags: string[];
  proof: { text: string; href: string; label: string }[];
};

const skills: Skill[] = [
  { id: "nodejs", name: "Node.js", category: "Languages & runtimes", usedIn: [{ label: "Invincix REST APIs", href: "/experience#invincix" }] },
  { id: "typescript", name: "TypeScript", category: "Languages & runtimes", usedIn: [{ label: "Runo backend services", href: "/experience#runo" }] },
  { id: "java", name: "Java", category: "Languages & runtimes", usedIn: [{ label: "LeetCode practice", href: "/about" }] },
  { id: "flutter", name: "Flutter", category: "Frameworks & APIs", usedIn: [{ label: "Invincix subscription app", href: "/experience#invincix" }] },
  { id: "rest-apis", name: "REST APIs", category: "Frameworks & APIs", usedIn: [{ label: "Invincix REST APIs", href: "/experience#invincix" }, { label: "Runo public API", href: "/experience#runo" }] },
  { id: "webhooks", name: "Webhooks", category: "Frameworks & APIs", usedIn: [{ label: "Runo public API", href: "/experience#runo" }, { label: "Payment integrations", href: "/experience#invincix" }] },
  { id: "dynamodb", name: "DynamoDB", category: "Data & storage", usedIn: [{ label: "API quota dashboards", href: "/experience#runo" }] },
  { id: "query-optimization", name: "Query optimization", category: "Data & storage", usedIn: [{ label: "API performance work", href: "/experience#invincix" }] },
  { id: "response-caching", name: "Response caching", category: "Data & storage", usedIn: [{ label: "API performance work", href: "/experience#invincix" }] },
  { id: "background-jobs", name: "Background jobs", category: "Messaging & async", usedIn: [{ label: "Lead allocation history", href: "/experience#runo" }] },
  { id: "aws", name: "AWS", category: "Cloud & delivery", usedIn: [{ label: "Runo backend services", href: "/experience#runo" }] },
  { id: "microservices", name: "Microservices", category: "Cloud & delivery", usedIn: [{ label: "Runo backend services", href: "/experience#runo" }] },
  { id: "rbac", name: "Role-based access control", category: "Security & quality", usedIn: [{ label: "Granular access permissions", href: "/experience#runo" }] },
  { id: "payment-verification", name: "Payment webhook verification", category: "Security & quality", usedIn: [{ label: "Payment integrations", href: "/experience#invincix" }] },
];

const notes: PlaybookNote[] = [
  {
    slug: "account-boundaries",
    title: "Keep product account boundaries explicit",
    blurb: "A distinct API product needed its own account type across authentication, administration and docs.",
    thesis: "When a product has a different access model, represent that boundary explicitly rather than relying on an endpoint-only distinction. The AI Call Analysis work introduced a separate account type and documented the change across the product surface.",
    tags: ["API design", "authentication", "account lifecycle"],
    proof: [{ text: "The API account type, admin configuration and login flow were changed together.", href: "/projects/ai-call-analysis-public-api", label: "AI Call Analysis API" }],
  },
  {
    slug: "usage-metering",
    title: "Make usage data explainable",
    blurb: "Usage dashboards depended on hourly and daily rollups that respected each customer's time zone.",
    thesis: "Metering is only useful when the displayed totals match the customer's view of time. The quota dashboard work used a DynamoDB metering table with hourly and daily rollups, including timezone-aware boundaries.",
    tags: ["DynamoDB", "metering", "time zones"],
    proof: [{ text: "Designed the metering table and timezone-aware rollups for API quota dashboards.", href: "/experience#runo", label: "Runo experience" }],
  },
  {
    slug: "permission-boundaries",
    title: "Prefer permissions that match real tasks",
    blurb: "One broad allocation permission was replaced with task-specific controls.",
    thesis: "A permission should describe the operation it grants. Granular controls made it possible to delegate import, export, delete and integrations separately instead of coupling them behind one switch.",
    tags: ["RBAC", "authorization", "least privilege"],
    proof: [{ text: "The permission change separated admin-web access from the admin permission.", href: "/experience#runo", label: "Data management permissions" }],
  },
  {
    slug: "background-archiving",
    title: "Move large archival work off the request path",
    blurb: "Large lead-allocation histories were archived by a background job rather than sending the full dataset.",
    thesis: "When request payload size creates timeout risk, move the work out of the synchronous path and pass the job enough information to fetch what it needs. The lead-allocation change sent a query instead of the full history dataset.",
    tags: ["Background jobs", "reliability", "data movement"],
    proof: [{ text: "Moved lead-allocation history archiving to a background job that sends a query.", href: "/experience#runo", label: "Runo experience" }],
  },
  {
    slug: "payment-reconciliation",
    title: "Verify payment callbacks before reconciling",
    blurb: "Payment integrations used webhook signature verification and reconciliation flows.",
    thesis: "Treat a payment callback as an input to verify and reconcile, not as an unconditional source of truth. The subscription app integrations included webhook signature verification and payment reconciliation.",
    tags: ["Webhooks", "payments", "verification"],
    proof: [{ text: "Integrated payment providers with signature-verified webhooks and reconciliation flows.", href: "/experience#invincix", label: "Invincix experience" }],
  },
];

export function getSkills(): Skill[] {
  return skills;
}

export function getPlaybookNotes(): PlaybookNote[] {
  return showDrafts() ? notes : [];
}

export function getSignalStats() {
  const metrics = getMetrics();
  return [
    { value: metrics.prs_merged, label: "Merged pull requests", sublabel: "Runo · Dec 2025–Oct 2026", href: "/experience#runo" },
    { value: metrics.repositories, label: "Repositories examined", sublabel: "Runo work record", href: "/experience#runo" },
    { value: metrics.prs_ai_api, label: "Merged PRs on the featured API", sublabel: "AI Call Analysis", href: "/projects/ai-call-analysis-public-api" },
    { value: metrics.repositories_ai_api, label: "Repositories on the featured API", sublabel: "AI Call Analysis", href: "/projects/ai-call-analysis-public-api" },
  ];
}

export function getSearchItems(): SearchItem[] {
  const pages: SearchItem[] = [
    { id: "home", type: "page", title: "Home", summary: "Backend engineer portfolio and featured work.", tags: ["intro"], href: "/" },
    { id: "projects", type: "page", title: "Projects", summary: "Backend project case studies.", tags: ["work"], href: "/projects" },
    { id: "system-design", type: "page", title: "System Design", summary: "Architecture diagrams and system details.", tags: ["architecture"], href: "/system-design" },
    { id: "dashboard", type: "page", title: "Dashboard", summary: "Verified career metrics with links to their sources.", tags: ["signal", "metrics"], href: "/dashboard" },
    { id: "about", type: "page", title: "About", summary: "Background, focus and education.", tags: ["profile"], href: "/about" },
    { id: "experience", type: "page", title: "Experience", summary: "Runo and Invincix engineering experience.", tags: ["work"], href: "/experience" },
    { id: "skills", type: "page", title: "Skills", summary: "Skills and where they are used.", tags: ["stack"], href: "/skills" },
    { id: "education", type: "page", title: "Education", summary: "Computer Science degree and academic record.", tags: ["profile"], href: "/education" },
    { id: "contact", type: "page", title: "Contact", summary: "Email, LinkedIn, GitHub and résumé.", tags: ["connect"], href: "/contact" },
  ];
  const projects: SearchItem[] = getCaseStudies().map((project) => ({
    id: project.slug,
    type: "project",
    title: project.title,
    summary: project.impact,
    tags: project.tags,
    href: `/projects/${project.slug}`,
  }));
  const skillItems: SearchItem[] = skills.map((skill) => ({
    id: skill.id,
    type: "skill",
    title: skill.name,
    summary: `Used in ${skill.usedIn.map((item) => item.label).join(", ")}.`,
    tags: [skill.category],
    href: `/skills#${skill.id}`,
  }));
  const education = getEducation();
  const credentials: SearchItem[] = [
    { id: "btech-computer-science", type: "credential", title: education.degree, summary: education.school, tags: ["education"], href: "/education" },
  ];
  return [...pages, ...projects, ...skillItems, ...credentials];
}

export function getPortfolioIdentity() {
  const site = getSite();
  const roles = getRoles();
  return { name: site.name, tagline: site.headline, roles };
}
