import type { ReactNode } from 'react'

interface TooltipProps {
  label: string
  children: ReactNode
  className?: string
  /** 'end' alinea el globo al borde derecho del control (para controles pegados al borde). */
  align?: 'center' | 'end'
}

// Funciona con hover (desktop), foco de teclado (accesibilidad) y :active
// (tap en mobile, donde no existe hover) — sin JS, solo CSS.
export function Tooltip({ label, children, className = '', align = 'center' }: TooltipProps) {
  return (
    <span className={`group relative inline-flex ${className}`}>
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none absolute top-full z-[60] mt-2 w-max max-w-56 ${align === 'end' ? 'right-0' : 'left-1/2 -translate-x-1/2'} rounded-md bg-ink-900 px-2.5 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100 group-active:opacity-100`}
      >
        {label}
      </span>
    </span>
  )
}
