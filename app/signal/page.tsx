import { fetchYCCompanies, fetchA16zPosts, fetchSequoiaPosts } from '@/lib/fetchers';
import { scoreSignals } from '@/lib/signals';
import SignalClient from './SignalClient';

export default async function SignalPage() {
  const [ycCompanies, a16zPosts, sequoiaPosts] = await Promise.all([
    fetchYCCompanies(),
    fetchA16zPosts(),
    fetchSequoiaPosts(),
  ]);

  const results = scoreSignals(ycCompanies, [...a16zPosts, ...sequoiaPosts]);
  console.log('[SignalPage] ycCompanies:', ycCompanies.length, 'vcPosts:', a16zPosts.length + sequoiaPosts.length, 'signals:', results.length);
  if (results.length > 0) console.log('[SignalPage] top signal:', results[0].company.name, 'score:', results[0].score);

  return (
    <>
      <SignalClient results={results} />
      <section className="bg-[#0a0a0a] px-6 pb-12 text-center">
        <h2 className="text-white text-sm font-semibold mb-3">Stay ahead of deal flow</h2>
        <a
          href="mailto:?subject=DealFlow%20Signal%20Digest&body=Send%20me%20daily%20consensus%20signals"
          className="inline-block px-5 py-2 text-sm font-medium text-orange-400 border border-orange-500 rounded-lg bg-transparent hover:bg-orange-500/10 transition-colors"
        >
          Request Daily Digest →
        </a>
      </section>
    </>
  );
}
