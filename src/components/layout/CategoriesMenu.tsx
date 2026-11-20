import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Category } from '../../types/product'
import { CategoryIcon } from '../CategoryIcon'
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
        aria-controls="menu-categorias"
        aria-label="Categorías"
        className="flex h-11 items-center gap-1.5 rounded-full border border-white/15 px-3.5 text-sm font-semibold text-white/85 transition hover:border-cyan-400 hover:text-cyan-400 active:scale-95"
      >
        <GridIcon className="h-5 w-5" />
        <span className="hidden sm:inline" aria-hidden="true">Categorías</span>
        <ChevronDownIcon className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <nav
          id="menu-categorias"
          aria-label="Categorías de productos"
          className="absolute left-0 top-full z-50 mt-2 max-h-[min(70svh,32rem)] w-80 max-w-[calc(100vw-2rem)] overflow-y-auto overscroll-contain rounded-2xl border border-white/10 bg-ink-800 p-2 shadow-2xl shadow-black/40"
        >
          <ul>
            {categories.map((category) => (
              <li key={category.slug}>
                <Link
                  to={`/categoria/${category.slug}`}
                  onClick={() => setOpen(false)}
                  className="flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-white/85 transition hover:bg-white/5 hover:text-cyan-400"
                >
                  <CategoryIcon category={category} className="h-5 w-5 shrink-0" />
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  )
}
