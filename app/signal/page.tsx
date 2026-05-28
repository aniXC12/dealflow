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

  return <SignalClient results={results} />;
}
