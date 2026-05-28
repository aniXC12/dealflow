export interface YCCompany {
  name: string;
  one_liner: string;
  batch: string;
  url: string;
  tags: string[];
}

export interface VCPost {
  title: string;
  link: string;
  pubDate: string;
  contentSnippet: string;
  source: 'a16z' | 'sequoia';
}

export interface HNStory {
  title: string;
  url: string;
  points: number;
  created_at: string;
}

export interface PHPost {
  title: string;
  tagline: string;
  url: string;
}
