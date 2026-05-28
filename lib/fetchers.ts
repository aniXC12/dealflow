import Parser from 'rss-parser';
import type { YCCompany, VCPost, HNStory, PHPost } from './types';

const parser = new Parser();

function makeSignal(timeoutMs: number): AbortSignal {
  return AbortSignal.timeout(timeoutMs);
}

async function fetchXML(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      signal: makeSignal(5000),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return res.text();
  } catch {
    return null;
  }
}

export async function fetchYCCompanies(): Promise<YCCompany[]> {
  try {
    const res = await fetch(
      'https://yc-oss.github.io/api/companies/all.json',
      {
        signal: makeSignal(5000),
        next: { revalidate: 3600 },
      }
    );
    if (!res.ok) {
      console.log('[fetchYCCompanies] HTTP', res.status);
      return [];
    }
    const data: YCCompany[] = await res.json();
    console.log('[fetchYCCompanies] total:', data.length, 'first keys:', Object.keys(data[0] ?? {}));
    return data.slice(-50);
  } catch (e) {
    console.error('[fetchYCCompanies] error:', e);
    return [];
  }
}

// a16z.com/feed/ and a16z.com/blog/feed/ both return 404 as of 2025.
// Active feed: https://a16z.substack.com/feed (tried in order as fallback chain).
const A16Z_FEED_URLS = [
  'https://a16z.com/feed/',
  'https://a16z.com/blog/feed/',
  'https://a16z.substack.com/feed',
];

export async function fetchA16zPosts(): Promise<VCPost[]> {
  for (const url of A16Z_FEED_URLS) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(url, {
        signal: controller.signal,
        next: { revalidate: 3600 },
      });
      clearTimeout(timer);
      console.log('[fetchA16zPosts] status:', res.status, 'url:', url);
      if (!res.ok) continue;
      const xml = await res.text();
      const feed = await parser.parseString(xml);
      if (feed.items.length === 0) continue;
      return feed.items.slice(0, 20).map((item) => {
        const snippet = item.contentSnippet?.trim() || '';
        const contentSnippet = snippet ||
          (item.content ?? '').replace(/<[^>]+>/g, '').slice(0, 200);
        return {
          title: item.title ?? '',
          link: item.link ?? '',
          pubDate: item.pubDate ?? '',
          contentSnippet,
          source: 'a16z' as const,
        };
      });
    } catch (e) {
      console.log('[fetchA16zPosts] failed:', url, e instanceof Error ? e.message : e);
    }
  }
  return [];
}

export async function fetchSequoiaPosts(): Promise<VCPost[]> {
  try {
    const xml = await fetchXML('https://www.sequoiacap.com/feed/');
    if (!xml) return [];
    const feed = await parser.parseString(xml);
    return feed.items.slice(0, 20).map((item) => {
      const stripped = (item.contentSnippet ?? '')
        .replace(/The post .* appeared first on Sequoia Capital\./, '')
        .replace(/&#\d+;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .trim();
      const contentSnippet = stripped ||
        (item.content ?? '')
          .replace(/<[^>]+>/g, '')
          .replace(/The post .* appeared first on Sequoia Capital\./, '')
          .trim()
          .slice(0, 200);
      return {
        title: item.title ?? '',
        link: item.link ?? '',
        pubDate: item.pubDate ?? '',
        contentSnippet,
        source: 'sequoia' as const,
      };
    });
  } catch {
    return [];
  }
}

interface HNHit {
  title: string;
  url: string;
  points: number;
  created_at: string;
}

interface HNResponse {
  hits: HNHit[];
}

export async function fetchHNStories(): Promise<HNStory[]> {
  try {
    const res = await fetch(
      'https://hn.algolia.com/api/v1/search?tags=story&hitsPerPage=30&query=startup+funding',
      {
        signal: makeSignal(5000),
        next: { revalidate: 3600 },
      }
    );
    if (!res.ok) return [];
    const data: HNResponse = await res.json();
    return data.hits.map((hit) => ({
      title: hit.title ?? '',
      url: hit.url ?? '',
      points: hit.points ?? 0,
      created_at: hit.created_at ?? '',
    }));
  } catch {
    return [];
  }
}

export async function fetchProductHuntPosts(): Promise<PHPost[]> {
  try {
    const xml = await fetchXML('https://www.producthunt.com/feed');
    if (!xml) return [];
    const feed = await parser.parseString(xml);
    return feed.items.slice(0, 10).map((item) => ({
      title: item.title ?? '',
      tagline: item.contentSnippet ?? '',
      url: item.link ?? '',
    }));
  } catch {
    return [];
  }
}
