import type { YCCompany, VCPost, SignalResult } from './types';

const SKIP_WORDS = new Set([
  'portfolio', 'team', 'excited', 'new', 'our', 'the', 'and', 'for',
  'with', 'that', 'this', 'from',
  'appeared', 'first', 'sequoia', 'capital', 'post', 'partnering', 'auctor', 'nominal',
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

function extractTitleWords(title: string): string[] {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length >= 4 && !/^\d+$/.test(t) && !SKIP_WORDS.has(t));
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
    titleWords: extractTitleWords(post.title),
    weight: getRecencyWeight(post.pubDate),
  }));

  const results: SignalResult[] = [];
  let rawCount = 0;

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

    for (const { post, themes, titleWords, weight } of postData) {
      let postScore = 0;

      // N-gram themes: exact phrase at full score, per-word partial at half score
      themes.forEach((_, theme) => {
        let exactScore = 0;
        if (nameLower.includes(theme)) exactScore += 3;
        if (linerLower.includes(theme)) exactScore += 2;
        if (tagsLower.includes(theme)) exactScore += 1;

        if (exactScore > 0) {
          postScore += exactScore * weight;
          matchedThemesSet.add(theme);
          return; // skip partial check for this theme
        }

        // Partial: any word (3+ chars) in the phrase present in name/liner/tags
        const words = theme.split(' ').filter((w) => w.length >= 3);
        let partialName = 0;
        let partialLiner = 0;
        let partialTags = 0;
        for (const word of words) {
          if (nameLower.includes(word)) partialName = 1.5;
          if (linerLower.includes(word)) partialLiner = 1.0;
          if (tagsLower.includes(word)) partialTags = 0.5;
        }
        const partialScore = partialName + partialLiner + partialTags;
        if (partialScore > 0) {
          postScore += partialScore * weight;
          matchedThemesSet.add(theme);
        }
      });

      // Individual meaningful words (4+ chars) from VC post title — +1 × weight per match
      for (const word of titleWords) {
        if (matchedThemesSet.has(word)) continue;
        if (
          nameLower.includes(word) ||
          linerLower.includes(word) ||
          tagsLower.includes(word)
        ) {
          postScore += 1.0 * weight;
          matchedThemesSet.add(word);
        }
      }

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

    if (totalScore > 0 && topPost !== undefined) {
      rawCount++;
      results.push({
        company,
        score: totalScore,
        matchedThemes: Array.from(matchedThemesSet),
        sources: Array.from(sourcesSet),
        consensus: a16zScore > 0 && sequoiaScore > 0,
        topPost,
      });
    }
  }

  const sorted = results.sort((a, b) => b.score - a.score);
  console.log('[scoreSignals] raw signals before slice:', rawCount, '→ returning:', Math.min(rawCount, 40));
  return sorted.slice(0, 40);
}
