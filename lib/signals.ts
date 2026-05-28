import type { YCCompany, VCPost, SignalResult } from './types';

const SKIP_WORDS = new Set([
  'portfolio', 'team', 'excited', 'new', 'our', 'the', 'and', 'for',
  'with', 'that', 'this', 'from',
]);

function extractThemes(post: VCPost): Map<string, number> {
  const text = `${post.title} ${post.contentSnippet}`
    .toLowerCase()
    .replace(/<[^>]+>/g, ' ')
    .replace(/[^\w\s]/g, ' ');

  const tokens = text
    .split(/\s+/)
    .filter((t) => t.length > 2 && !/^\d+$/.test(t));

  const themes = new Map<string, number>();

  for (let i = 0; i < tokens.length - 1; i++) {
    const a = tokens[i];
    const b = tokens[i + 1];
    if (!SKIP_WORDS.has(a) && !SKIP_WORDS.has(b)) {
      const phrase = `${a} ${b}`;
      themes.set(phrase, (themes.get(phrase) ?? 0) + 1);
    }
  }

  for (let i = 0; i < tokens.length - 2; i++) {
    const a = tokens[i];
    const b = tokens[i + 1];
    const c = tokens[i + 2];
    if (!SKIP_WORDS.has(a) && !SKIP_WORDS.has(b) && !SKIP_WORDS.has(c)) {
      const phrase = `${a} ${b} ${c}`;
      themes.set(phrase, (themes.get(phrase) ?? 0) + 1);
    }
  }

  return themes;
}

function getRecencyWeight(pubDate: string): number {
  let ts = new Date(pubDate).getTime();
  if (isNaN(ts)) ts = Date.parse(pubDate);
  if (isNaN(ts)) {
    console.log('[getRecencyWeight] unparseable pubDate:', JSON.stringify(pubDate));
    return 0.3;
  }
  console.log('[getRecencyWeight] parsed:', JSON.stringify(pubDate), '->', new Date(ts).toISOString());
  const ageDays = (Date.now() - ts) / 86_400_000;
  if (ageDays < 7) return 1.0;
  if (ageDays <= 30) return 0.7;
  return 0.3;
}

export function scoreSignals(
  ycCompanies: YCCompany[],
  vcPosts: VCPost[]
): SignalResult[] {
  const postData = vcPosts.map((post) => ({
    post,
    themes: extractThemes(post),
    weight: getRecencyWeight(post.pubDate),
  }));

  const results: SignalResult[] = [];

  for (const company of ycCompanies) {
    const nameLower = company.name.toLowerCase();
    const linerLower = company.one_liner.toLowerCase();
    const tagsLower = company.tags.map((t) => t.toLowerCase()).join(' ');

    let totalScore = 0;
    let a16zScore = 0;
    let sequoiaScore = 0;
    const matchedThemesSet = new Set<string>();
    const sourcesSet = new Set<'a16z' | 'sequoia'>();
    let topPost: VCPost | undefined;
    let topPostScore = 0;

    for (const { post, themes, weight } of postData) {
      let postScore = 0;

      themes.forEach((_, theme) => {
        let themeScore = 0;
        if (nameLower.includes(theme)) themeScore += 3;
        if (linerLower.includes(theme)) themeScore += 2;
        if (tagsLower.includes(theme)) themeScore += 1;

        if (themeScore > 0) {
          postScore += themeScore * weight;
          matchedThemesSet.add(theme);
        }
      });

      if (postScore > 0) {
        totalScore += postScore;
        sourcesSet.add(post.source);
        if (post.source === 'a16z') a16zScore += postScore;
        else sequoiaScore += postScore;

        if (postScore > topPostScore) {
          topPostScore = postScore;
          topPost = post;
        }
      }
    }

    if (totalScore === 0 || topPost === undefined) continue;

    results.push({
      company,
      score: totalScore,
      matchedThemes: Array.from(matchedThemesSet),
      sources: Array.from(sourcesSet),
      consensus: a16zScore > 0 && sequoiaScore > 0,
      topPost,
    });
  }

  return results.sort((a, b) => b.score - a.score).slice(0, 40);
}
