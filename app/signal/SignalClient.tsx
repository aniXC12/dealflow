'use client';

import { useState } from 'react';
import type { SignalResult } from '@/lib/types';

type Filter = 'All' | 'Consensus Only' | 'a16z' | 'Sequoia';

const FILTERS: Filter[] = ['All', 'Consensus Only', 'a16z', 'Sequoia'];

export default function SignalClient({ results }: { results: SignalResult[] }) {
  const [filter, setFilter] = useState<Filter>('All');

  const filtered = results.filter((r) => {
    if (filter === 'Consensus Only') return r.consensus;
    if (filter === 'a16z') return r.sources.includes('a16z');
    if (filter === 'Sequoia') return r.sources.includes('sequoia');
    return true;
  });

  const consensusCount = results.filter((r) => r.consensus).length;

  return (
    <main className="min-h-screen bg-[#0a0a0a] p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-white">Signal Intelligence</h1>
      </header>

      <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg px-4 py-3 mb-6">
        <p className="text-orange-400 font-medium">
          {consensusCount} consensus signals found
        </p>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-orange-500 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map((result) => {
          const scoreBadgeClass =
            result.score > 10
              ? 'bg-green-500/20 text-green-400'
              : result.score >= 5
                ? 'bg-yellow-500/20 text-yellow-400'
                : 'bg-zinc-700 text-zinc-400';

          return (
            <div
              key={result.company.name}
              className="bg-zinc-900 rounded-xl p-5 border border-zinc-800"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-white font-bold">{result.company.name}</h3>
                    {result.consensus && (
                      <span className="text-xs px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 font-semibold">
                        CONSENSUS
                      </span>
                    )}
                  </div>
                  <p className="text-zinc-400 text-sm mt-1">{result.company.one_liner}</p>
                </div>
                <span
                  className={`text-sm px-3 py-1 rounded-full font-bold shrink-0 ${scoreBadgeClass}`}
                >
                  {result.score.toFixed(1)}
                </span>
              </div>

              {result.matchedThemes.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {[...result.matchedThemes]
                    .sort((a, b) => b.length - a.length)
                    .slice(0, 8)
                    .map((theme) => (
                    <span
                      key={theme}
                      className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-3 mt-3 flex-wrap">
                {result.sources.map((source) => (
                  <span
                    key={source}
                    className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-medium"
                  >
                    {source}
                  </span>
                ))}
                <a
                  href={result.topPost.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-500 text-xs hover:text-orange-400 transition-colors truncate"
                >
                  {result.topPost.title}
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
