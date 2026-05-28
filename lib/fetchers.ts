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
      'https://yc-oss.github.io/api/companies/launched.json',
      {
        signal: makeSignal(5000),
        next: { revalidate: 3600 },
      }
    );
    if (!res.ok) return [];
    const data: YCCompany[] = await res.json();
    return data.slice(-50);
  } catch {
    return [];
  }
}

export async function fetchA16zPosts(): Promise<VCPost[]> {
  try {
    const xml = await fetchXML('https://a16z.com/feed/');
    if (!xml) return [];
    const feed = await parser.parseString(xml);
    return feed.items.slice(0, 20).map((item) => ({
      title: item.title ?? '',
      link: item.link ?? '',
      pubDate: item.pubDate ?? '',
      contentSnippet: item.contentSnippet ?? '',
      source: 'a16z' as const,
    }));
  } catch {
    return [];
  }
}

export async function fetchSequoiaPosts(): Promise<VCPost[]> {
  try {
    const xml = await fetchXML('https://www.sequoiacap.com/feed/');
    if (!xml) return [];
    const feed = await parser.parseString(xml);
    return feed.items.slice(0, 20).map((item) => ({
      title: item.title ?? '',
      link: item.link ?? '',
      pubDate: item.pubDate ?? '',
      contentSnippet: item.contentSnippet ?? '',
      source: 'sequoia' as const,
    }));
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
