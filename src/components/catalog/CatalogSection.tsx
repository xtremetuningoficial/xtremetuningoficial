import { categories } from '../../data/categories'
import { categoryIcons } from '../../data/categoryIcons'
import { products } from '../../data/products'
import { ProductCard } from './ProductCard'

interface CatalogSectionProps {
  activeCategory: string
  onSelect: (slug: string) => void
}

export function CatalogSection({ activeCategory, onSelect }: CatalogSectionProps) {
  const filtered =
    activeCategory === 'all' ? products : products.filter((p) => p.categorySlug === activeCategory)

  return (
    <section id="catalogo" className="bg-paper-50 py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <header className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-ember-500">
              Catálogo
            </span>
            <h2 className="font-display text-2xl uppercase text-ink-900 sm:text-3xl">
              Precio de producto + instalación, sin sorpresas
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            <FilterPill
              label="Todos"
              icon="✨"
              active={activeCategory === 'all'}
              onClick={() => onSelect('all')}
            />
            {categories.map((category) => (
              <FilterPill
                key={category.slug}
                label={category.shortName}
                icon={categoryIcons[category.slug]}
                active={activeCategory === category.slug}
                onClick={() => onSelect(category.slug)}
              />
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="py-16 text-center text-ink-900/50">
            Todavía no hay productos en esta categoría. Escríbenos por WhatsApp y te contamos qué
            tenemos disponible.
          </p>
        )}
      </div>
    </section>
  )
}

function FilterPill({
  label,
  icon,
  active,
  onClick,
}: {
  label: string
  icon: string
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
      <span>{icon}</span>
      {label}
    </button>
  )
}
