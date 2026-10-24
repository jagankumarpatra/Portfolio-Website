export type QAEntry = {
  id: string; question: string; keywords: string[]; answer: string;
  followUps: string[]; href: string; sourceLabel: string;
};

export type QAResult = {
  matched: boolean;
  shortened: boolean;
  entry?: QAEntry;
  reply?: string;
};

export const MAX_INPUT = 300;

const STOPWORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "do", "does", "did", "you", "your", "i", "me", "my", "we",
  "of", "to", "in", "on", "for", "and", "or", "with", "about", "what", "how", "can", "tell", "please", "it",
]);

function stem(word: string): string {
  return word.length > 3 ? word.replace(/(ing|ed|es|s)$/, "") : word;
}

export function normalize(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9+#\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !STOPWORDS.has(w))
    .map(stem);
}

export function sanitize(input: string): { text: string; shortened: boolean } {
  const clean = input.replace(/[\u0000-\u001f\u007f]/g, " ").trim();
  if (clean.length > MAX_INPUT) return { text: clean.slice(0, MAX_INPUT), shortened: true };
  return { text: clean, shortened: false };
}

export function answerQuestion(raw: string, entries: QAEntry[]): QAResult {
  const { text, shortened } = sanitize(raw);
  const greeting = text.toLowerCase().replace(/[.!?,]+$/g, "").trim();
  if (/^(hi|hello|hey|howdy)( there)?([,.! ]+(how are you|how is it going|what's up))?[.!?]*$/.test(greeting) ||
      /^good (morning|afternoon|evening)[.!?]*$/.test(greeting)) {
    return {
      matched: true,
      shortened,
      reply: "Hi! Ask me about Jagan's projects, experience, skills, education or contact details. I answer from published portfolio notes and won't guess undocumented details.",
    };
  }

  const query = new Set(normalize(text));
  const keywordFrequency = new Map<string, number>();
  for (const entry of entries) {
    for (const keyword of new Set(entry.keywords.flatMap(normalize))) {
      keywordFrequency.set(keyword, (keywordFrequency.get(keyword) ?? 0) + 1);
    }
  }
  let best: { entry: QAEntry; hits: number; ratio: number } | undefined;

  for (const entry of entries) {
    const matchedKeywords = entry.keywords
      .map((keyword) => normalize(keyword))
      .filter((words) => words.length > 0 && words.every((word) => query.has(word)));
    const hits = matchedKeywords.length;
    const hasSpecificHit = matchedKeywords.some((words) =>
      words.some((word) => (keywordFrequency.get(word) ?? 0) === 1),
    );
    const eligible = hits >= 2 || (hits === 1 && hasSpecificHit);
    if (!eligible) continue;
    const ratio = hits / entry.keywords.length;
    if (
      !best ||
      hits > best.hits ||
      (hits === best.hits && ratio > best.ratio) ||
      (hits === best.hits && ratio === best.ratio && entry.id < best.entry.id)
    ) {
      best = { entry, hits, ratio };
    }
  }
  return best ? { matched: true, shortened, entry: best.entry } : { matched: false, shortened };
}
