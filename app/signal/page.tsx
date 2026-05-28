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

  return <SignalClient results={results} />;
}
