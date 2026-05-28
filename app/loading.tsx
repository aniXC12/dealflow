export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-4">
      <div className="w-48 h-3 rounded-full bg-zinc-600 animate-pulse" />
      <p className="text-zinc-500 text-sm">Fetching signals...</p>
    </div>
  );
}
