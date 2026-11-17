// Shown straight away when the For You feed is opening, while it's ranked.
export default function FYPLoading() {
  return (
    <div
      className="flex h-[calc(100dvh-var(--odini-user-header-height))] items-center justify-center bg-black"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="h-[80%] w-full max-w-sm animate-pulse mx-4 rounded-3xl bg-white/10" />
      <span className="sr-only">Loading your feed…</span>
    </div>
  )
}
