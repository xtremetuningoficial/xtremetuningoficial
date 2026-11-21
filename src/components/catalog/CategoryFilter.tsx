import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '../icons'

export interface FilterOption {
  key: string
  label: string
  count: number
  icon: ReactNode
  active: boolean
  tone?: 'default' | 'deal'
  onSelect: () => void
}

// El único selector de categorías de la tienda: una fila que se desliza con el dedo. Cuando
// hay más opciones a un lado, ese borde se desvanece y aparece una flecha de 44 px, así nada
// queda cortado sin aviso. La opción activa se trae a la vista sola.
export function CategoryFilter({ options, label }: { options: FilterOption[]; label: string }) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [edges, setEdges] = useState({ left: false, right: false })

  const measure = useCallback(() => {
    const el = scrollerRef.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    setEdges({ left: el.scrollLeft > 4, right: el.scrollLeft < max - 4 })
  }, [])

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    measure()
    el.addEventListener('scroll', measure, { passive: true })
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => {
      el.removeEventListener('scroll', measure)
      observer.disconnect()
    }
  }, [measure, options.length])

  const activeKey = options.find((o) => o.active && o.tone !== 'deal')?.key
  useEffect(() => {
    const el = scrollerRef.current
    const chip = el?.querySelector<HTMLElement>(`[data-key="${activeKey}"]`)
    if (!el || !chip) return
    // Se mueve sólo la fila (no la página) para dejar la opción activa a la vista.
    const left = chip.offsetLeft - el.clientWidth / 2 + chip.offsetWidth / 2
    const suave = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollTo({ left: Math.max(0, left), behavior: suave ? 'smooth' : 'auto' })
  }, [activeKey])

  function nudge(direction: 1 | -1) {
    const el = scrollerRef.current
    if (!el) return
    const suave = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollBy({ left: direction * el.clientWidth * 0.7, behavior: suave ? 'smooth' : 'auto' })
  }

  const mask = `linear-gradient(to right, ${edges.left ? 'transparent, #000 3rem' : '#000, #000'}, ${
    edges.right ? '#000 calc(100% - 3.5rem), transparent' : '#000'
  })`

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        role="group"
        aria-label={label}
        // relative: los textos sr-only de las opciones quedan dentro del recorte (si no, estiran la página a lo ancho).
        className="scrollbar-none relative flex gap-2 overflow-x-auto overscroll-x-contain py-1"
        style={{ maskImage: mask, WebkitMaskImage: mask }}
      >
        {options.map((option) => (
          <Chip key={option.key} option={option} />
        ))}
      </div>

      {edges.left && (
        <button
          type="button"
          onClick={() => nudge(-1)}
          aria-label="Ver categorías anteriores"
          tabIndex={-1}
          className="absolute left-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-ink-900/15 bg-white text-ink-900 shadow-md shadow-ink-900/10 transition hover:border-electric-500 hover:text-electric-500"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
      )}
      {edges.right && (
        <button
          type="button"
          onClick={() => nudge(1)}
          aria-label="Ver más categorías"
          tabIndex={-1}
          className="absolute right-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-ink-900/15 bg-white text-ink-900 shadow-md shadow-ink-900/10 transition hover:border-electric-500 hover:text-electric-500"
        >
          <ChevronRightIcon className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}

function Chip({ option }: { option: FilterOption }) {
  const { active, tone = 'default' } = option
  const activeClasses =
    tone === 'deal' ? 'border-ember-500 bg-ember-500 text-white' : 'border-ink-900 bg-ink-900 text-white'
  const idleClasses =
    tone === 'deal'
      ? 'border-ember-500/40 bg-white text-ember-500 hover:border-ember-500'
      : 'border-ink-900/15 bg-white text-ink-900/80 hover:border-electric-500 hover:text-ink-900'
  const countClasses = active
    ? tone === 'deal'
      ? 'bg-white/20 text-white'
      : 'bg-cyan-400 text-ink-900'
    : 'bg-ink-900/5 text-ink-900/70'

  return (
    <button
      type="button"
      data-key={option.key}
      onClick={option.onSelect}
      aria-pressed={active}
      className={`flex min-h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border pl-3.5 pr-2 text-sm font-semibold transition active:scale-95 ${
        active ? activeClasses : idleClasses
      }`}
    >
      {option.icon}
      <span>{option.label}</span>
      <span className={`min-w-6 rounded-full px-1.5 py-0.5 text-center font-mono text-xs font-bold ${countClasses}`}>
        <span className="sr-only">, </span>
        {option.count}
        <span className="sr-only"> productos</span>
      </span>
    </button>
  )
}
