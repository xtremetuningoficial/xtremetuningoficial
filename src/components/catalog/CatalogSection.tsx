import { useMemo, useState } from 'react'
import type { ComponentType } from 'react'
import { categoryIcons } from '../../data/categoryIcons'
import type { Category, Product } from '../../types/product'
import { GENERAL_INQUIRY_LINK } from '../../lib/whatsapp'
import { GridIcon } from '../icons'
import { ProductCard } from './ProductCard'
import { ProductCardSkeleton } from './ProductCardSkeleton'
import { SearchBar } from './SearchBar'

interface CatalogSectionProps {
  categories: Category[]
  products: Product[]
  status: 'loading' | 'success' | 'error'
  activeCategory: string
  onSelect: (slug: string) => void
}

export function CatalogSection({
  categories,
  products,
  status,
  activeCategory,
  onSelect,
}: CatalogSectionProps) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const byCategory =
      activeCategory === 'all' ? products : products.filter((p) => p.categorySlug === activeCategory)

    const term = search.trim().toLowerCase()
    if (!term) return byCategory

    return byCategory.filter((product) => product.name.toLowerCase().includes(term))
  }, [products, activeCategory, search])

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

          <div className="flex flex-wrap gap-2">
            <FilterPill
              label="Todos"
              icon={GridIcon}
              active={activeCategory === 'all'}
              onClick={() => onSelect('all')}
            />
            {categories.map((category) => (
              <FilterPill
                key={category.slug}
                label={category.name}
                icon={categoryIcons[category.slug]}
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
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {filtered.length === 0 && (
              <p className="py-16 text-center text-ink-900/60">
                No encontramos productos con ese criterio. Escríbenos por WhatsApp y te contamos
                qué tenemos disponible.
              </p>
            )}
          </>
        )}
      </div>
    </section>
  )
}

function FilterPill({
  label,
  icon: Icon,
  active,
  onClick,
}: {
  label: string
  icon: ComponentType<{ className?: string }>
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition ${
        active
          ? 'border-electric-500 bg-electric-500 text-white'
          : 'border-ink-900/15 bg-white text-ink-900/70 hover:border-electric-500/50'
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  )
}
