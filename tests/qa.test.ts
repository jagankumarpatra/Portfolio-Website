import { describe, expect, it } from "vitest";
import { answerQuestion, MAX_INPUT, normalize, sanitize, type QAEntry } from "@/lib/qa";
import { getQA } from "@/lib/content";

const e = (id: string, keywords: string[]): QAEntry => ({
  id, question: id, keywords, answer: `answer ${id}`, followUps: [], href: "/", sourceLabel: "x",
});
const entries = [e("q01", ["years", "experience"]), e("q02", ["runo", "work", "role", "shipped"]), e("q09", ["leetcode"])];

describe("answerQuestion", () => {
  it("matches on two or more keyword hits", () => {
    const r = answerQuestion("How many years of experience do you have?", entries);
    expect(r.matched).toBe(true);
    expect(r.entry?.id).toBe("q01");
  });
  it("matches a single-keyword entry on one hit", () => {
    expect(answerQuestion("leetcode?", entries).entry?.id).toBe("q09");
  });
  it("answers greetings without using the unknown-question fallback", () => {
    const result = answerQuestion("hi!", entries);
    expect(result.matched).toBe(true);
    expect(result.reply).toContain("published portfolio notes");
  });
  it("answers a casual greeting follow-up", () => {
    expect(answerQuestion("Hey, how are you?", entries).reply).toContain("Hi!");
  });
  it("matches the real API scope question to its cited answer", () => {
    const result = answerQuestion("Why did you use recording links instead of file uploads?", getQA());
    expect(result.entry?.id).toBe("q15");
    expect(result.entry?.answer).toContain("left out of scope");
  });
  it("matches one unambiguous keyword from a multi-keyword entry", () => {
    expect(answerQuestion("tell me about runo", entries).entry?.id).toBe("q02");
  });
  it("does not match one ambiguous keyword from a multi-keyword entry", () => {
    const overlapping = [e("q01", ["backend", "experience"]), e("q02", ["backend", "projects"])];
    expect(answerQuestion("backend", overlapping).matched).toBe(false);
  });
  it("returns no match for unrelated questions", () => {
    expect(answerQuestion("what is your favourite colour", entries).matched).toBe(false);
  });
  it("breaks ties by the lower id", () => {
    const tie = [e("q05", ["alpha", "beta"]), e("q04", ["alpha", "beta"])];
    expect(answerQuestion("alpha beta", tie).entry?.id).toBe("q04");
  });
  it("sanitizes special characters and still matches", () => {
    expect(answerQuestion("years!!! <b>experience</b> ???", entries).entry?.id).toBe("q01");
  });
  it("truncates input over the limit and reports it", () => {
    const long = "years experience ".repeat(40);
    expect(long.length).toBeGreaterThan(MAX_INPUT);
    const r = answerQuestion(long, entries);
    expect(r.shortened).toBe(true);
    expect(sanitize(long).text.length).toBe(MAX_INPUT);
  });
  it("normalizes stopwords and plurals", () => {
    expect(normalize("What are the PRs?")).toEqual(["prs"]);
  });
});
