'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { ThemeFrequency } from '@/lib/themes';

export default function ThemesChart({ themes }: { themes: ThemeFrequency[] }) {
  return (
    <main className="min-h-screen bg-[#0a0a0a] p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white">Theme Analysis</h1>
        <p className="text-zinc-400 text-sm mt-1">Investment themes extracted from a16z and Sequoia content — updated hourly</p>
      </header>

      <div className="bg-zinc-900 rounded-xl p-6 mb-8" style={{ height: 580 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={themes}
            margin={{ top: 0, right: 24, bottom: 0, left: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
            <XAxis
              type="number"
              stroke="#52525b"
              tick={{ fill: '#71717a', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              type="category"
              dataKey="theme"
              width={170}
              stroke="#52525b"
              tick={{ fill: '#a1a1aa', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.04)' }}
              contentStyle={{
                backgroundColor: '#18181b',
                border: '1px solid #3f3f46',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '13px',
              }}
            />
            <Bar dataKey="count" fill="#f97316" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left px-4 py-3 text-zinc-400 font-medium">Theme</th>
              <th className="text-right px-4 py-3 text-zinc-400 font-medium">a16z</th>
              <th className="text-right px-4 py-3 text-zinc-400 font-medium">Sequoia</th>
              <th className="text-right px-4 py-3 text-zinc-400 font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {themes.map((row) => (
              <tr
                key={row.theme}
                className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors"
              >
                <td className="px-4 py-3 text-white font-medium">{row.theme}</td>
                <td className="px-4 py-3 text-right text-zinc-300">{row.a16zCount}</td>
                <td className="px-4 py-3 text-right text-zinc-300">{row.sequoiaCount}</td>
                <td className="px-4 py-3 text-right text-orange-400 font-medium">{row.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-zinc-600 text-xs mt-4">
        * Sequoia feed publishes titles only — article content unavailable via RSS.
      </p>
    </main>
  );
}
