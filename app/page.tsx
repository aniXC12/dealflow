import { formatDistanceToNow } from 'date-fns';
import { fetchYCCompanies, fetchA16zPosts, fetchSequoiaPosts, fetchHNStories } from '@/lib/fetchers';
import type { VCPost, HNStory } from '@/lib/types';

export default async function Home() {
  const [ycCompanies, a16zPosts, sequoiaPosts, hnStories] = await Promise.all([
    fetchYCCompanies(),
    fetchA16zPosts(),
    fetchSequoiaPosts(),
    fetchHNStories(),
  ]);

  const displayYC = [...ycCompanies]
    .filter(
      (c) =>
        c.name.length <= 60 &&
        !c.one_liner.includes('->') &&
        !c.one_liner.includes('Moon Hotel') &&
        c.one_liner.trim() !== '' &&
        c.batch.trim() !== '',
    )
    .sort((a, b) => b.batch.localeCompare(a.batch))
    .slice(0, 30);

  const displayA16z = a16zPosts.slice(0, 15);
  const displaySequoia = sequoiaPosts.slice(0, 15);
  const displayHN = hnStories.slice(0, 15);

  return (
    <main className="min-h-screen bg-[#0a0a0a] p-6">
      <header className="flex items-center gap-3 mb-6">
        <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
        <div>
          <h1 className="text-3xl font-bold text-white">DealFlow</h1>
          <p className="text-sm text-zinc-400">Real-time VC signal tracking</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shrink-0" />
            <p className="text-xs text-zinc-500">
              Live · {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · Updates hourly
            </p>
          </div>
        </div>
      </header>

      <div className="border-b border-orange-900/30 mb-6" />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Column 1: Latest YC Batch */}
        <div>
          <h2 className="text-white font-semibold mb-4">Latest YC Batch</h2>
          <div className="space-y-3">
            {displayYC.length === 0 ? (
              <EmptyFeed />
            ) : (
              displayYC.map((company) => (
                <div key={company.url} className="bg-zinc-900 rounded-lg p-4">
                  <a
                    href={company.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white font-bold hover:text-orange-400 transition-colors"
                  >
                    {company.name}
                  </a>
                  <p className="text-zinc-400 text-sm mt-1">{company.one_liner}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-xs px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 font-medium">
                      {company.batch}
                    </span>
                    {company.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 rounded bg-zinc-700 text-zinc-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 2: a16z Signals */}
        <div>
          <h2 className="text-white font-semibold mb-4">a16z Signals</h2>
          <div className="space-y-3">
            {displayA16z.length === 0 ? (
              <EmptyFeed />
            ) : (
              displayA16z.map((post) => (
                <VCPostCard key={post.link} post={post} />
              ))
            )}
          </div>
        </div>

        {/* Column 3: Sequoia Signals */}
        <div>
          <h2 className="text-white font-semibold mb-4">Sequoia Signals</h2>
          <div className="space-y-3">
            {displaySequoia.length === 0 ? (
              <EmptyFeed />
            ) : (
              displaySequoia.map((post) => (
                <VCPostCard key={post.link} post={post} />
              ))
            )}
          </div>
        </div>

        {/* Column 4: HN Buzz */}
        <div>
          <h2 className="text-white font-semibold mb-4">HN Buzz</h2>
          <div className="space-y-3">
            {displayHN.length === 0 ? (
              <EmptyFeed />
            ) : (
              displayHN.map((story) => (
                <HNStoryCard key={story.url || story.title} story={story} />
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function EmptyFeed() {
  return (
    <div className="flex items-center justify-center py-12">
      <p className="text-zinc-600 text-sm text-center">
        Feed temporarily unavailable — check back shortly
      </p>
    </div>
  );
}

function VCPostCard({ post }: { post: VCPost }) {
  const date = new Date(post.pubDate);
  const relativeDate = isNaN(date.getTime())
    ? ''
    : formatDistanceToNow(date, { addSuffix: true });

  const hasSnippet = post.contentSnippet.trim().length > 0;

  if (!hasSnippet) {
    return (
      <div className="bg-zinc-900 rounded-lg p-4">
        <a
          href={post.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-white font-semibold hover:text-orange-400 transition-colors leading-snug block"
        >
          {post.title}
        </a>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-zinc-500 text-xs">{relativeDate}</span>
          <a
            href={post.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 text-xs hover:text-orange-400 transition-colors"
          >
            → Read on Sequoia
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 rounded-lg p-4">
      <a
        href={post.link}
        target="_blank"
        rel="noopener noreferrer"
        className="text-white font-medium hover:text-orange-400 transition-colors leading-snug block"
      >
        {post.title}
      </a>
      <p className="text-zinc-500 text-xs mt-1">{relativeDate}</p>
      <p className="text-zinc-400 text-sm mt-2 line-clamp-2">{post.contentSnippet}</p>
    </div>
  );
}

function HNStoryCard({ story }: { story: HNStory }) {
  const date = new Date(story.created_at);
  const relativeDate = isNaN(date.getTime())
    ? ''
    : formatDistanceToNow(date, { addSuffix: true });

  return (
    <div className="bg-zinc-900 rounded-lg p-4">
      {story.url ? (
        <a
          href={story.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-white font-medium hover:text-orange-400 transition-colors leading-snug block"
        >
          {story.title}
        </a>
      ) : (
        <p className="text-white font-medium leading-snug">{story.title}</p>
      )}
      <div className="flex items-center gap-2 mt-2">
        <span className="text-xs px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 font-medium">
          {story.points} pts
        </span>
        <span className="text-zinc-500 text-xs">{relativeDate}</span>
      </div>
    </div>
  );
}
