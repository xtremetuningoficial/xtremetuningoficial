import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Tooltip } from '../ui/Tooltip'
import type { AdminProduct } from '../../types/admin'

interface LowStockBellProps {
  lowStockProducts: AdminProduct[]
  threshold: number
  onThresholdChange: (value: number) => void
}

export function LowStockBell({ lowStockProducts, threshold, onThresholdChange }: LowStockBellProps) {
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
      <Tooltip label="Alertas de stock bajo">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label="Ver alertas de stock bajo"
          aria-expanded={open}
          className="relative flex h-9 w-9 items-center justify-center rounded-full border border-ink-900/15 bg-white text-ink-900/70 transition hover:border-electric-500/50"
        >
          <BellIcon className="h-5 w-5" />
          {lowStockProducts.length > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-ember-500 px-1 text-[11px] font-bold text-white">
              {lowStockProducts.length}
            </span>
          )}
        </button>
      </Tooltip>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-2xl border border-ink-900/10 bg-white p-4 shadow-xl">
          <label className="flex items-center justify-between gap-2 text-xs font-semibold text-ink-900/60">
            Umbral de stock bajo
            <input
              type="number"
              min={0}
              value={threshold}
              onChange={(e) => onThresholdChange(Math.max(0, Number(e.target.value)))}
              className="w-16 rounded-full border border-ink-900/15 bg-white px-3 py-1.5 text-center text-sm text-ink-900 focus:border-electric-500"
            />
          </label>

          <div className="mt-3 max-h-64 overflow-y-auto border-t border-ink-900/10 pt-3">
            {lowStockProducts.length === 0 ? (
              <p className="text-sm text-ink-900/60">Ningún producto activo está bajo el umbral.</p>
            ) : (
              <ul className="space-y-2">
                {lowStockProducts.map((product) => (
                  <li key={product.id}>
                    <Link
                      to={`/admin/productos/${product.id}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm transition hover:bg-paper-50"
                    >
                      <span className="text-ink-900">{product.name}</span>
                      <span className="shrink-0 rounded-full bg-hazard-400/20 px-2 py-0.5 text-xs font-bold text-ember-500">
                        {product.stockQuantity} en stock
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function BellIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}
