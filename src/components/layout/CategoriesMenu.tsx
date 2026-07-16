import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Category } from '../../types/product'
import { categoryIcons, DEFAULT_CATEGORY_ICON } from '../../data/categoryIcons'
import { ChevronDownIcon, GridIcon } from '../icons'

// La lista de categorías crece con el tiempo (empezó en 4, ya va en 7+),
// así que en vez de listarlas todas en la barra — donde tarde o temprano
// se apeñuzcan o se envuelven en varias líneas — viven en este menú
// desplegable de tamaño fijo, sin importar cuántas categorías haya.
export function CategoriesMenu({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-2 text-sm font-semibold text-white/80 transition hover:border-cyan-400 hover:text-cyan-400 sm:px-3.5"
      >
        <GridIcon className="h-4 w-4" />
        <span className="hidden sm:inline">Categorías</span>
        <ChevronDownIcon className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 top-full z-50 mt-2 w-72 rounded-2xl border border-white/10 bg-ink-800 p-2 shadow-2xl shadow-black/40"
        >
          {categories.map((category) => {
            const Icon = categoryIcons[category.slug] ?? DEFAULT_CATEGORY_ICON
            return (
              <Link
                key={category.slug}
                to={`/categoria/${category.slug}`}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/5 hover:text-cyan-400"
              >
                <Icon className="h-4 w-4 shrink-0" />
                {category.name}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
