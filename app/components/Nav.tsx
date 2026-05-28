import Link from 'next/link';

export default function Nav() {
  return (
    <nav className="bg-zinc-950 border-b border-zinc-800 w-full">
      <div className="flex items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          <span className="text-white font-bold text-lg">DealFlow</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-zinc-400 hover:text-white transition-colors text-sm"
          >
            Feed
          </Link>
          <Link
            href="/signal"
            className="text-zinc-400 hover:text-white transition-colors text-sm"
          >
            Signals
          </Link>
          <Link
            href="/themes"
            className="text-zinc-400 hover:text-white transition-colors text-sm"
          >
            Themes
          </Link>
        </div>
      </div>
    </nav>
  );
}
