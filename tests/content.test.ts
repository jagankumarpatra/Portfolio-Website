import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Content is imported fresh per test, so the draft gating reads the environment each time.
async function load() {
  vi.resetModules();
  return import("@/lib/content");
}

describe("draft gating", () => {
  beforeEach(() => vi.unstubAllEnvs());
  afterEach(() => vi.unstubAllEnvs());

  it("shows approved and draft work in development", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const c = await load();
    expect(c.getCaseStudies().length).toBe(3);
    expect(c.getSystems().length).toBe(2);
  });

  it("hides every draft in production unless SHOW_DRAFTS is set", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("SHOW_DRAFTS", "false");
    const c = await load();
    expect(c.getCaseStudies().map((item) => item.slug)).toEqual(["ai-call-analysis-public-api"]);
    expect(c.getSystems().map((item) => item.id)).toEqual(["ai-call-analysis"]);
    expect(c.getQA().every((q) => !q.draft)).toBe(true);
    expect(c.getQA().length).toBeGreaterThan(0);
  });

  it("only exposes Q&As whose sources are visible in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("SHOW_DRAFTS", "false");
    const c = await load();
    for (const q of c.getQA()) {
      expect(q.href.startsWith("/work/")).toBe(false);
      expect(q.href.startsWith("/system-design")).toBe(false);
      expect(q.followUps).toHaveLength(2);
    }
  });

  it("replaces tokens and rejects unknown ones", async () => {
    const c = await load();
    expect(c.t("{{prs_merged}} merged PRs")).toBe("321 merged PRs");
    expect(() => c.t("{{nope}}")).toThrow(/Unknown metric token/);
  });

  it("uses the corrected recording-link facts in the published case study", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("SHOW_DRAFTS", "false");
    const c = await load();
    const project = c.getCaseStudy("ai-call-analysis-public-api");
    expect(project?.impact).toContain("secure recording link");
    expect(project?.approach.join(" ")).toContain("28 merged pull requests");
    expect(project?.impact).not.toContain("upload");
  });
});
