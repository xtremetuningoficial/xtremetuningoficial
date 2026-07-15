import { categoryIcons } from '../../data/categoryIcons'
import type { Category, Product } from '../../types/product'

interface CategorySectionProps {
  categories: Category[]
  products: Product[]
  activeCategory: string
  onSelect: (slug: string) => void
}

export function CategorySection({
  categories,
  products,
  activeCategory,
  onSelect,
}: CategorySectionProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-ember-500">
            Explora
          </span>
          <h2 className="font-display text-2xl uppercase text-ink-900 sm:text-3xl">
            ¿Qué le vamos a instalar a tu vehículo?
          </h2>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {categories.map((category) => {
          const count = products.filter((p) => p.categorySlug === category.slug).length
          const isActive = activeCategory === category.slug

          return (
            <button
              key={category.slug}
              type="button"
              onClick={() => {
                onSelect(category.slug)
                document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' })
              }}
              className={`group relative overflow-hidden rounded-2xl border p-5 text-left transition sm:p-6 ${
                isActive
                  ? 'border-electric-500 bg-ink-900 text-white'
                  : 'border-ink-900/10 bg-white text-ink-900 hover:border-electric-500/40 hover:shadow-md'
              }`}
            >
              <span className="text-3xl">{categoryIcons[category.slug]}</span>
              <p className="mt-4 font-display text-base uppercase leading-tight sm:text-lg">
                {category.name}
              </p>
              <p
                className={`mt-1 font-mono text-xs ${isActive ? 'text-cyan-400' : 'text-ink-900/50'}`}
              >
                {count} producto{count === 1 ? '' : 's'}
              </p>
            </button>
          )
        })}
      </div>
    </section>
  )
}
