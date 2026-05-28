import type { VCPost } from './types';

export interface ThemeFrequency {
  theme: string;
  count: number;
  a16zCount: number;
  sequoiaCount: number;
}

const SKIP_WORDS = new Set([
  'portfolio', 'team', 'excited', 'new', 'our', 'the', 'and', 'for',
  'with', 'that', 'this', 'from',
  'appeared', 'nominal', 'spotlight', 'partnering', 'auctor',
  'isn', 'why', 'road', 'brick', 'yellow', 'dead', 'layer',
  'also', 'most', 'boring',
]);

const BLOCKED_PHRASES = new Set([
  'appeared first', 'first sequoia', 'sequoia capital',
  'appeared first sequoia', 'first sequoia capital',
  'post partnering', 'all systems', 'systems nominal',
  'nominal nominal', 'nominal spotlight',
  'isn dead', 'layer isn', 'road why', 'brick road', 'yellow brick',
  'app layer', 'avoiding death', 'everything everywhere',
  'opportunity also', 'also its', 'its most', 'most boring',
  'science small', 'small business', 'computer science',
  'charts week', 'week memory', 'memory moon', 'reflections sohn',
]);

function extractNgrams(text: string): string[] {
  const cleaned = text
    .toLowerCase()
    .replace(/<[^>]+>/g, ' ')
    .replace(/[^\w\s]/g, ' ');

  const tokens = cleaned
    .split(/\s+/)
    .filter((t) => t.length > 2 && !/^\d+$/.test(t));

  const ngrams: string[] = [];

  for (let i = 0; i < tokens.length - 1; i++) {
    const a = tokens[i];
    const b = tokens[i + 1];
    if (!SKIP_WORDS.has(a) && !SKIP_WORDS.has(b)) {
      ngrams.push(`${a} ${b}`);
    }
  }

  for (let i = 0; i < tokens.length - 2; i++) {
    const a = tokens[i];
    const b = tokens[i + 1];
    const c = tokens[i + 2];
    if (!SKIP_WORDS.has(a) && !SKIP_WORDS.has(b) && !SKIP_WORDS.has(c)) {
      ngrams.push(`${a} ${b} ${c}`);
    }
  }

  return ngrams;
}

function isBoilerplate(theme: string): boolean {
  if (BLOCKED_PHRASES.has(theme)) return true;
  const words = theme.split(' ');
  if (words.every((w) => SKIP_WORDS.has(w))) return true;
  const shortCount = words.filter((w) => w.length < 4).length;
  return shortCount > words.length / 2;
}

export function getThemeFrequency(vcPosts: VCPost[]): ThemeFrequency[] {
  const totals: Record<string, { total: number; a16z: number; sequoia: number }> = {};

  for (const post of vcPosts) {
    const ngrams = extractNgrams(`${post.title} ${post.contentSnippet}`);
    const freq: Record<string, number> = {};
    for (const ngram of ngrams) {
      freq[ngram] = (freq[ngram] ?? 0) + 1;
    }
    for (const [ngram, count] of Object.entries(freq)) {
      if (isBoilerplate(ngram)) continue;
      if (!totals[ngram]) totals[ngram] = { total: 0, a16z: 0, sequoia: 0 };
      totals[ngram].total += count;
      if (post.source === 'a16z') totals[ngram].a16z += count;
      else totals[ngram].sequoia += count;
    }
  }

  // Sort by score desc; break ties by word count desc so longer phrases survive dedup
  const sorted = Object.entries(totals).sort(
    (a, b) =>
      b[1].total - a[1].total ||
      b[0].split(' ').length - a[0].split(' ').length,
  );

  // Remove any theme whose word set is a strict subset of an already-kept theme's word set
  const kept: typeof sorted = [];
  for (const entry of sorted) {
    const themeWords = new Set(entry[0].split(' '));
    const dominated = kept.some(([keptTheme]) => {
      const keptWords = new Set(keptTheme.split(' '));
      return (
        themeWords.size < keptWords.size &&
        Array.from(themeWords).every((w) => keptWords.has(w))
      );
    });
    if (!dominated) kept.push(entry);
  }

  return kept.slice(0, 20).map(([theme, counts]) => ({
    theme,
    count: counts.total,
    a16zCount: counts.a16z,
    sequoiaCount: counts.sequoia,
  }));
}
