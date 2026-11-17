// Shown straight away when a host page is opening, while its data loads.
// The host navbar stays on screen, so only the page area shows this.
export default function HostLoading() {
  return (
    <main className="min-h-screen bg-[#F8F7F7]" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <div className="mx-auto max-w-7xl animate-pulse px-4 py-8 sm:px-6">
        <div className="h-8 w-56 rounded bg-black/10" />
        <div className="mt-3 h-4 w-72 max-w-full rounded bg-black/5" />

        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl border border-black/5 bg-white" />
          ))}
        </div>

        <div className="mt-8 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-2xl border border-black/5 bg-white" />
          ))}
        </div>
      </div>
    </main>
  )
}
