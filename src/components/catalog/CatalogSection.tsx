import { useEffect, useMemo, useState } from 'react'
import type { Category, Product } from '../../types/product'
import type { RatingSummary } from '../../types/review'
import { buildWhatsAppLink, GENERAL_INQUIRY_LINK } from '../../lib/whatsapp'
import { GridIcon, TagIcon, WhatsAppIcon } from '../icons'
import { CategoryIcon } from '../CategoryIcon'
import { CategoryFilter, type FilterOption } from './CategoryFilter'
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

// Primer bloque: 8 en celular (4 filas de 2) y 12 desde 640 px; "Ver más" suma 12.
const MORE_STEP = 12
function firstBlock() {
  return typeof window !== 'undefined' && window.matchMedia('(min-width: 640px)').matches ? 12 : 8
}

const GRID = 'grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4'

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
  const [visible, setVisible] = useState(firstBlock)
  const dealsCount = useMemo(() => products.filter((p) => p.discountPercent > 0).length, [products])
  const showDeals = onlyDeals && dealsCount > 0

  const countBySlug = useMemo(() => {
    const counts = new Map<string, number>()
    for (const p of products) counts.set(p.categorySlug, (counts.get(p.categorySlug) ?? 0) + 1)
    return counts
  }, [products])

  const filtered = useMemo(() => {
    const byCategory =
      activeCategory === 'all' ? products : products.filter((p) => p.categorySlug === activeCategory)
    const byDeal = showDeals ? byCategory.filter((p) => p.discountPercent > 0) : byCategory

    const term = search.trim().toLowerCase()
    if (!term) return byDeal

    return byDeal.filter((product) => product.name.toLowerCase().includes(term))
  }, [products, activeCategory, search, showDeals])

  // Al cambiar el filtro o la búsqueda se vuelve al primer bloque.
  useEffect(() => {
    setVisible(firstBlock())
  }, [activeCategory, search, showDeals])

  const options: FilterOption[] = [
    {
      key: 'all',
      label: 'Todos',
      count: products.length,
      icon: <GridIcon className="h-4 w-4 shrink-0" />,
      active: activeCategory === 'all',
      onSelect: () => onSelect('all'),
    },
    ...(dealsCount > 0
      ? [
          {
            key: 'ofertas',
            label: 'Ofertas',
            count: dealsCount,
            icon: <TagIcon className="h-4 w-4 shrink-0" />,
            active: showDeals,
            tone: 'deal' as const,
            onSelect: () => setOnlyDeals((current) => !current),
          },
        ]
      : []),
    ...categories
      // Mientras carga se ven todas; ya con datos, sólo las que tienen productos (y la elegida).
      .filter((c) => status !== 'success' || (countBySlug.get(c.slug) ?? 0) > 0 || c.slug === activeCategory)
      .map((category) => ({
        key: category.slug,
        label: category.name,
        count: countBySlug.get(category.slug) ?? 0,
        icon: <CategoryIcon category={category} className="h-4 w-4 shrink-0" />,
        active: activeCategory === category.slug,
        onSelect: () => onSelect(category.slug),
      })),
  ]

  const shown = filtered.slice(0, visible)
  const remaining = filtered.length - shown.length
  const term = search.trim()

  return (
    <section id="catalogo" aria-labelledby="catalogo-titulo" className="bg-paper-50 pb-14 pt-10 sm:pb-16 sm:pt-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <h2 id="catalogo-titulo" className="text-balance font-display text-2xl uppercase leading-tight text-ink-900 sm:text-3xl">
            Precio de producto + instalación, sin sorpresas
          </h2>
          <SearchBar value={search} onChange={setSearch} />
        </header>
      </div>

      {/* Filtro pegajoso: queda a mano mientras se baja por el catálogo. */}
      <div className="sticky top-[var(--tope,60px)] z-30 mt-4 border-b border-ink-900/5 bg-paper-50/95 backdrop-blur supports-[backdrop-filter]:bg-paper-50/85">
        <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6">
          <CategoryFilter options={options} label="Filtrar el catálogo por categoría" />
        </div>
      </div>

      <div className="mx-auto mt-5 max-w-7xl px-4 sm:px-6">
        {status === 'loading' && (
          <div className={GRID} aria-busy="true" aria-label="Cargando productos">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        )}

        {status === 'error' && (
          <div className="rounded-2xl border border-ember-500/30 bg-ember-500/5 px-4 py-12 text-center">
            <p className="font-display text-lg uppercase text-ink-900">No pudimos cargar el catálogo</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink-900/70">
              Puede ser algo temporal de conexión. Mientras lo resolvemos, escríbenos por WhatsApp
              y te contamos qué tenemos disponible.
            </p>
            <a
              href={GENERAL_INQUIRY_LINK}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-full bg-electric-500 px-6 text-sm font-bold text-white transition hover:bg-electric-400"
            >
              <WhatsAppIcon className="h-5 w-5" />
              Escribir por WhatsApp
            </a>
          </div>
        )}

        {status === 'success' && (
          <>
            <p className="mb-3 font-mono text-xs text-ink-900/65" aria-live="polite">
              {filtered.length === 0
                ? 'Sin resultados'
                : `Mostrando ${shown.length} de ${filtered.length} ${filtered.length === 1 ? 'producto' : 'productos'}`}
            </p>

            {shown.length > 0 && (
              <div className={GRID}>
                {shown.map((product) => (
                  <ProductCard key={product.id} product={product} rating={ratings?.[product.id]} />
                ))}
              </div>
            )}

            {remaining > 0 && (
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={() => setVisible((v) => v + MORE_STEP)}
                  className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full border-2 border-ink-900 px-6 text-sm font-bold text-ink-900 transition hover:bg-ink-900 hover:text-white sm:w-auto"
                >
                  Ver más productos
                  <span className="font-mono text-xs">({remaining})</span>
                </button>
              </div>
            )}

            {filtered.length === 0 && (
              <div className="rounded-2xl border border-ink-900/10 bg-white px-4 py-12 text-center">
                <p className="font-display text-lg uppercase text-ink-900">
                  {term ? `No encontramos "${term}"` : showDeals ? 'No hay ofertas aquí por ahora' : 'Esta categoría está vacía por ahora'}
                </p>
                <p className="mx-auto mt-2 max-w-md text-sm text-ink-900/70">
                  Puede que lo tengamos y aún no esté en la tienda en línea. Pregúntanos por
                  WhatsApp y te contamos.
                </p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                  {term && (
                    <button
                      type="button"
                      onClick={() => setSearch('')}
                      className="inline-flex min-h-11 items-center rounded-full border border-ink-900/20 px-5 text-sm font-bold text-ink-900 transition hover:border-electric-500 hover:text-electric-500"
                    >
                      Borrar búsqueda
                    </button>
                  )}
                  {!term && showDeals && (
                    <button
                      type="button"
                      onClick={() => setOnlyDeals(false)}
                      className="inline-flex min-h-11 items-center rounded-full border border-ink-900/20 px-5 text-sm font-bold text-ink-900 transition hover:border-electric-500 hover:text-electric-500"
                    >
                      Quitar filtro de ofertas
                    </button>
                  )}
                  <a
                    href={
                      term
                        ? buildWhatsAppLink(`Hola Xtreme Tuning, ¿tienen ${term}?`)
                        : GENERAL_INQUIRY_LINK
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center gap-2 rounded-full bg-electric-500 px-5 text-sm font-bold text-white transition hover:bg-electric-400"
                  >
                    <WhatsAppIcon className="h-5 w-5" />
                    {term ? 'Preguntar por WhatsApp' : 'Escribir por WhatsApp'}
                  </a>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
