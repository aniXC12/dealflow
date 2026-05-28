import { fetchA16zPosts, fetchSequoiaPosts } from '@/lib/fetchers';
import { getThemeFrequency } from '@/lib/themes';
import ThemesChart from './ThemesChart';

export default async function ThemesPage() {
  const [a16zPosts, sequoiaPosts] = await Promise.all([
    fetchA16zPosts(),
    fetchSequoiaPosts(),
  ]);

  const themes = getThemeFrequency([...a16zPosts, ...sequoiaPosts]);

  return <ThemesChart themes={themes} />;
}
