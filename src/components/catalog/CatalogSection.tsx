import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Category, Product } from '../../types/product'
import type { RatingSummary } from '../../types/review'
import { GENERAL_INQUIRY_LINK } from '../../lib/whatsapp'
import { GridIcon, TagIcon } from '../icons'
import { CategoryIcon } from '../CategoryIcon'
import { Tooltip } from '../ui/Tooltip'
import { ProductCard } from './ProductCard'
import { ProductCardSkeleton } from './ProductCardSkeleton'
import { SearchBar } from './SearchBar'

interface CatalogSectionProps {
  categories: Category[]
  products: Product[]
  status: 'loading' | 'success' | 'error'
  activeCategory: string
  onSelect: (slug: string) => void
  ratings?: Record<string, RatingSummary>
}

export function CatalogSection({
  categories,
  products,
  status,
  activeCategory,
  onSelect,
  ratings,
}: CatalogSectionProps) {
  const [search, setSearch] = useState('')
  const [onlyDeals, setOnlyDeals] = useState(false)
  const dealsCount = useMemo(() => products.filter((p) => p.discountPercent > 0).length, [products])
  const showDeals = onlyDeals && dealsCount > 0

  const filtered = useMemo(() => {
    const byCategory =
      activeCategory === 'all' ? products : products.filter((p) => p.categorySlug === activeCategory)
    const byDeal = showDeals ? byCategory.filter((p) => p.discountPercent > 0) : byCategory

    const term = search.trim().toLowerCase()
    if (!term) return byDeal

    return byDeal.filter((product) => product.name.toLowerCase().includes(term))
  }, [products, activeCategory, search, showDeals])

  return (
    <section id="catalogo" className="bg-paper-50 py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <header className="mb-8 flex flex-col gap-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-ember-500">
                Catálogo
              </span>
              <h2 className="font-display text-2xl uppercase text-ink-900 sm:text-3xl">
                Precio de producto + instalación, sin sorpresas
              </h2>
            </div>

            <SearchBar value={search} onChange={setSearch} />
          </div>

          <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
            <FilterPill
              label="Todos"
              icon={<GridIcon className="h-4 w-4 shrink-0" />}
              active={activeCategory === 'all'}
              onClick={() => onSelect('all')}
            />
            {dealsCount > 0 && (
              <FilterPill
                label={`Ofertas (${dealsCount})`}
                icon={<TagIcon className="h-4 w-4 shrink-0" />}
                active={showDeals}
                tone="deal"
                onClick={() => setOnlyDeals((current) => !current)}
              />
            )}
            {categories.map((category) => (
              <FilterPill
                key={category.slug}
                label={category.name}
                icon={<CategoryIcon category={category} className="h-4 w-4 shrink-0" />}
                active={activeCategory === category.slug}
                onClick={() => onSelect(category.slug)}
              />
            ))}
          </div>
        </header>

        {status === 'loading' && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        )}

        {status === 'error' && (
          <div className="rounded-2xl border border-ember-500/30 bg-ember-500/5 py-16 text-center">
            <p className="font-display text-lg uppercase text-ink-900">
              No pudimos cargar el catálogo
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink-900/60">
              Puede ser algo temporal de conexión. Mientras lo resolvemos, escríbenos por
              WhatsApp y te contamos qué tenemos disponible.
            </p>
            <a
              href={GENERAL_INQUIRY_LINK}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-electric-500 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-electric-400"
            >
              Escribir por WhatsApp
            </a>
          </div>
        )}

        {status === 'success' && (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} rating={ratings?.[product.id]} />
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="py-16 text-center text-ink-900/60">
                <p>
                  {showDeals
                    ? 'No hay ofertas en esta categoría por ahora.'
                    : 'No encontramos productos con ese criterio.'}{' '}
                  Escríbenos por WhatsApp y te contamos qué tenemos disponible.
                </p>
                {showDeals && (
                  <button
                    type="button"
                    onClick={() => setOnlyDeals(false)}
                    className="mt-4 text-sm font-semibold text-electric-500 underline underline-offset-4 hover:text-electric-400"
                  >
                    Ver todos los productos
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}

function FilterPill({
  label,
  icon,
  active,
  tone = 'default',
  onClick,
}: {
  label: string
  icon: ReactNode
  active: boolean
  tone?: 'default' | 'deal'
  onClick: () => void
}) {
  const activeClasses =
    tone === 'deal' ? 'border-ember-500 bg-ember-500 text-white' : 'border-electric-500 bg-electric-500 text-white'
  const idleClasses =
    tone === 'deal'
      ? 'border-ember-500/30 bg-white text-ember-500 hover:border-ember-500/60'
      : 'border-ink-900/15 bg-white text-ink-900/70 hover:border-electric-500/50'

  return (
    <Tooltip label={label} className="shrink-0">
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-semibold transition ${
          active ? activeClasses : idleClasses
        }`}
      >
        {icon}
        <span className="max-w-[150px] truncate sm:max-w-[240px]">{label}</span>
      </button>
    </Tooltip>
  )
}
