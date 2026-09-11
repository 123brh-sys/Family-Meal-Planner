// Levenshtein-distance based fuzzy matching for canonical ingredient lookup (§6).
// Small and dependency-free rather than pulling in a library for one algorithm.

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  let previousRow = Array.from({ length: b.length + 1 }, (_, i) => i);

  for (let i = 0; i < a.length; i++) {
    const currentRow = [i + 1];
    for (let j = 0; j < b.length; j++) {
      const insertCost = currentRow[j] + 1;
      const deleteCost = previousRow[j + 1] + 1;
      const substituteCost = previousRow[j] + (a[i] === b[j] ? 0 : 1);
      currentRow.push(Math.min(insertCost, deleteCost, substituteCost));
    }
    previousRow = currentRow;
  }

  return previousRow[b.length];
}

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

/** 1 = identical, 0 = completely different. */
export function similarity(a: string, b: string): number {
  const normA = normalize(a);
  const normB = normalize(b);
  if (!normA || !normB) return 0;
  const maxLen = Math.max(normA.length, normB.length);
  return 1 - levenshtein(normA, normB) / maxLen;
}

export interface FuzzyMatchable {
  name: string;
  synonyms: string[];
}

export interface FuzzyMatch<T extends FuzzyMatchable> {
  item: T;
  score: number;
}

/**
 * Ranks candidates by how closely `query` matches their name or any synonym,
 * using each candidate's single best-matching string as its score.
 */
export function findFuzzyMatches<T extends FuzzyMatchable>(
  query: string,
  candidates: T[],
  threshold = 0.72
): FuzzyMatch<T>[] {
  const matches: FuzzyMatch<T>[] = [];
  for (const item of candidates) {
    const best = Math.max(
      similarity(query, item.name),
      ...item.synonyms.map((s) => similarity(query, s))
    );
    if (best >= threshold) matches.push({ item, score: best });
  }
  return matches.sort((a, b) => b.score - a.score);
}
