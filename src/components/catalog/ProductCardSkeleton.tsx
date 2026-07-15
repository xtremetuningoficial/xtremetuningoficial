export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-ink-900/10 bg-white">
      <div className="aspect-[4/3] animate-pulse bg-paper-100" />
      <div className="flex flex-col gap-3 p-4 sm:p-5">
        <div className="h-4 w-3/4 animate-pulse rounded bg-paper-100" />
        <div className="h-3 w-full animate-pulse rounded bg-paper-100" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-paper-100" />
        <div className="mt-2 h-5 w-1/2 animate-pulse rounded bg-paper-100" />
        <div className="mt-3 h-10 w-full animate-pulse rounded-full bg-paper-100" />
      </div>
    </div>
  )
}
