// Shown straight away when a customer page is opening, while its data loads.
// The navbar stays on screen, so only the page area shows this.
export default function UserLoading() {
  return (
    <main className="min-h-screen bg-black text-white" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <div className="mx-auto max-w-7xl animate-pulse px-4 py-6 sm:px-6 sm:py-8">
        <div className="h-3 w-28 rounded bg-white/10" />
        <div className="mt-3 h-8 w-64 rounded bg-white/10" />
        <div className="mt-3 h-4 w-80 max-w-full rounded bg-white/5" />

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
              <div className="aspect-[4/3] bg-white/10" />
              <div className="space-y-2 p-4">
                <div className="h-4 w-3/4 rounded bg-white/10" />
                <div className="h-3 w-1/2 rounded bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
