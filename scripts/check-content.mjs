// Content checks from the rulebook (section 2). Fails the build on any violation.
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const errors = [];
const fail = (file, msg) => errors.push(`${file}: ${msg}`);

const files = ["site", "experience", "case-studies", "architecture", "qa"];
const data = Object.fromEntries(files.map((f) => [f, read(`content/${f}.json`)]));
const metrics = read("content/metrics.json");

// ---- denylist (local file, git-ignored) ----
const denyPath = path.join(root, "content/denylist.txt");
let deny = [];
if (fs.existsSync(denyPath)) {
  deny = fs.readFileSync(denyPath, "utf8").split(/\r?\n/).map((l) => l.trim().toLowerCase()).filter((l) => l && !l.startsWith("#"));
} else {
  console.warn("WARN content/denylist.txt not found: denylist scan skipped.");
}

// ---- numbers allowed in copy: every numeric token that appears in a metric value ----
const NUM = /\d+(?:\.\d+)?/g;
const allowedNumbers = new Set([
  ...Object.values(metrics).flatMap((v) => v.match(NUM) ?? []),
  ...(data.site.phone.match(NUM) ?? []), // the phone number in the mailto text
]);

const SKIP_KEYS = new Set([
  "id", "slug", "source", "ref", "type", "status", "evidenceTag", "approvedOn", "caseStudySlug", "nodeId",
  "keywords", "followUps", "x", "y", "resumeUpdated", "email", "phone", "linkedin", "github", "categories",
]);
const MARKERS = /\[CONFIRM\]|\[NEEDS INPUT\]|NEEDS INPUT|\bTODO\b|lorem ipsum|placeholder|example\.com|email@example/i;
const TICKET = /\b[A-Z]{2,6}-\d{2,6}\b/;

function* strings(value, key = "") {
  if (typeof value === "string") {
    if (!SKIP_KEYS.has(key)) yield [key, value];
  } else if (Array.isArray(value)) {
    for (const v of value) yield* strings(v, key);
  } else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) yield* strings(v, k);
  }
}

for (const [name, content] of Object.entries(data)) {
  for (const [key, raw] of strings(content)) {
    if (key === "needsInput") continue; // preview-only notes for the owner
    const file = `content/${name}.json (${key})`;
    // tokens must exist
    for (const m of raw.matchAll(/\{\{\s*([a-z0-9_]+)\s*\}\}/gi)) {
      if (!(m[1] in metrics)) fail(file, `unknown metric token {{${m[1]}}}`);
    }
    const text = raw.replace(/\{\{\s*[a-z0-9_]+\s*\}\}/gi, "");
    if (MARKERS.test(text)) fail(file, `marker or placeholder text: "${raw.slice(0, 60)}"`);
    if (TICKET.test(text)) fail(file, `ticket-ID pattern found: "${raw.slice(0, 60)}"`);
    const lower = text.toLowerCase();
    for (const term of deny) if (lower.includes(term)) fail(file, `denylisted term "${term}"`);
    // typed numbers (ignore emails, urls, 4-digit years, and the version numbers listed in metrics)
    const scrubbed = text.replace(/[\w.+-]+@[\w.-]+/g, "").replace(/https?:\/\/\S+/g, "").replace(/\b20\d\d\b/g, "").replace(/\b[a-z]{2,}\d+\b/gi, ""); // years, and names like mp3 or s3
    for (const n of scrubbed.match(NUM) ?? []) {
      if (!allowedNumbers.has(n)) fail(file, `number "${n}" is not in metrics.json: "${raw.slice(0, 70)}"`);
    }
  }
}

// ---- gating rules ----
const gate = (file, item, label) => {
  if (item.status !== "approved" && item.status !== "draft") fail(file, `${label}: status must be approved or draft`);
  if (item.status === "approved") {
    if (!item.approvedOn) fail(file, `${label}: approved without approvedOn`);
    if (item.evidenceTag === "INF") fail(file, `${label}: INF content cannot be approved`);
  }
};
data.experience.roles.forEach((r) => gate("experience.json", r, r.company));
data["case-studies"].items.forEach((c) => {
  gate("case-studies.json", c, c.slug);
  if (c.status === "approved" && (!c.lessons || c.lessons.length === 0)) fail("case-studies.json", `${c.slug}: approved without lessons`);
});
data.architecture.systems.forEach((s) => {
  gate("architecture.json", s, s.id);
  const ids = new Set(s.nodes.map((n) => n.id));
  s.nodes.forEach((n) => {
    gate("architecture.json", n, `${s.id}/${n.id}`);
    if (s.status === "approved" && n.status !== "approved") fail("architecture.json", `${s.id}: approved system contains draft node ${n.id}`);
  });
  s.edges.forEach(([a, b]) => { if (!ids.has(a) || !ids.has(b)) fail("architecture.json", `${s.id}: edge ${a}->${b} has unknown node`); });
});

// ---- Q&A rules ----
const qa = data.qa.items;
const qaIds = new Set(qa.map((q) => q.id));
const caseSlugs = new Map(data["case-studies"].items.map((c) => [c.slug, c]));
const nodeOwner = new Map(data.architecture.systems.flatMap((s) => s.nodes.map((n) => [n.id, { s, n }])));
const pages = new Set(["experience", "cv", "about", "contact"]);
qa.forEach((q) => {
  gate("qa.json", q, q.id);
  const words = q.answer.replace(/\{\{\s*[a-z0-9_]+\s*\}\}/g, "x").trim().split(/\s+/).length;
  if (words > 120) fail("qa.json", `${q.id}: answer has ${words} words (max 120)`);
  if (q.followUps.length !== 2 || q.followUps.some((f) => !qaIds.has(f) || f === q.id)) fail("qa.json", `${q.id}: followUps must be two other valid ids`);
  const { type, ref } = q.source;
  if (type === "page" && !pages.has(ref)) fail("qa.json", `${q.id}: unknown page source ${ref}`);
  if (type === "case" && !caseSlugs.has(ref)) fail("qa.json", `${q.id}: unknown case source ${ref}`);
  if (type === "node" && !nodeOwner.has(ref)) fail("qa.json", `${q.id}: unknown node source ${ref}`);
  if (q.status === "approved") {
    if (type === "case" && caseSlugs.get(ref)?.status !== "approved") fail("qa.json", `${q.id}: approved but its case study is a draft`);
    if (type === "node") {
      const o = nodeOwner.get(ref);
      if (o && (o.s.status !== "approved" || o.n.status !== "approved")) fail("qa.json", `${q.id}: approved but its node or system is a draft`);
    }
  }
});

// ---- meta description length (140 to 160 characters after token substitution) ----
const sub = (s) => s.replace(/\{\{\s*([a-z0-9_]+)\s*\}\}/gi, (_m, k) => metrics[k] ?? "");
const desc = sub(data.site.metaDescription);
if (desc.length < 140 || desc.length > 160) fail("site.json", `metaDescription is ${desc.length} characters (need 140 to 160)`);

// ---- source files: no placeholders ----
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}
for (const f of walk(path.join(root, "src")).filter((p) => /\.(ts|tsx|css)$/.test(p))) {
  const text = fs.readFileSync(f, "utf8");
  const bad = text.match(/\bTODO\b|lorem ipsum|example\.com|email@example|\bNEEDS INPUT\b/i);
  if (bad) fail(path.relative(root, f), `placeholder text "${bad[0]}"`);
  // a typed number inside rendered JSX text, such as <p>50K+ calls</p>
  for (const m of text.matchAll(/>([^<>{}\n]*\d[^<>{}\n]*)</g)) {
    if (/^\s*[\d\s.,:;()+-]*$/.test(m[1]) && !/[A-Za-z]/.test(m[1])) continue;
    fail(path.relative(root, f), `number typed into JSX text: "${m[1].trim()}" (use a metric token)`);
  }
}

if (errors.length) {
  console.error(`\ncheck:content FAILED (${errors.length})\n` + errors.map((e) => ` - ${e}`).join("\n"));
  process.exit(1);
}
console.log(`check:content OK (${qa.length} Q&As, ${data["case-studies"].items.length} case studies, ${data.architecture.systems.length} systems, meta description ${desc.length} chars)`);
