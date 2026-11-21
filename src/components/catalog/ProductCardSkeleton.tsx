// Mismas proporciones que ProductCard para que al llegar los datos nada salte.
export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-ink-900/10 bg-white sm:rounded-2xl" aria-hidden="true">
      <div className="aspect-square animate-pulse bg-paper-100 sm:aspect-[4/3]" />
      <div className="flex flex-col gap-2.5 p-3 sm:p-5">
        <div className="h-4 w-11/12 animate-pulse rounded bg-paper-100" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-paper-100" />
        <div className="mt-2 h-5 w-1/2 animate-pulse rounded bg-paper-100" />
        <div className="mt-2 h-11 w-full animate-pulse rounded-full bg-paper-100" />
      </div>
    </div>
  )
}
