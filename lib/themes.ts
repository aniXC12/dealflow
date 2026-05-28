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
]);

const BLOCKED_PHRASES = new Set([
  'appeared first', 'first sequoia', 'sequoia capital',
  'appeared first sequoia', 'first sequoia capital',
  'post partnering', 'all systems', 'systems nominal',
  'nominal nominal', 'nominal spotlight',
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
  return theme.split(' ').every((w) => SKIP_WORDS.has(w));
}

export function getThemeFrequency(vcPosts: VCPost[]): ThemeFrequency[] {
  const totals: Record<string, { total: number; a16z: number; sequoia: number }> = {};

  for (const post of vcPosts) {
    const ngrams = extractNgrams(`${post.title} ${post.contentSnippet}`);
    for (const ngram of ngrams) {
      if (isBoilerplate(ngram)) continue;
      if (!totals[ngram]) totals[ngram] = { total: 0, a16z: 0, sequoia: 0 };
      totals[ngram].total += 1;
      if (post.source === 'a16z') totals[ngram].a16z += 1;
      else totals[ngram].sequoia += 1;
    }
  }

  return Object.entries(totals)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 20)
    .map(([theme, counts]) => ({
      theme,
      count: counts.total,
      a16zCount: counts.a16z,
      sequoiaCount: counts.sequoia,
    }));
}
