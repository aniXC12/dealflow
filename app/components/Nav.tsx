'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Nav() {
  const pathname = usePathname();

  const linkClass = (href: string) =>
    `transition-colors text-sm ${
      pathname === href ? 'text-white font-medium' : 'text-zinc-400 hover:text-white'
    }`;

  return (
    <nav className="bg-zinc-950 border-b border-zinc-800 w-full">
      <div className="flex items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          <span className="text-white font-bold text-lg">DealFlow</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/" className={linkClass('/')}>Feed</Link>
          <Link href="/signal" className={linkClass('/signal')}>Signals</Link>
          <Link href="/themes" className={linkClass('/themes')}>Themes</Link>
        </div>
      </div>
    </nav>
  );
}
