import type { ReactNode } from 'react'
import { AlertTriangleIcon } from '../icons'
import { buttonPrimary, card } from './ui'

// Estados de las pantallas del panel: cargando, error y vacío, con el mismo aspecto en todas.

export function SkeletonList({ rows = 4, rowClassName = 'h-16' }: { rows?: number; rowClassName?: string }) {
  return (
    <div className="mt-6 space-y-3" aria-busy="true" aria-live="polite">
      <span className="sr-only">Cargando…</span>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={`animate-pulse rounded-2xl bg-ink-800 ${rowClassName}`} aria-hidden="true" />
      ))}
    </div>
  )
}

export function ErrorState({
  title,
  detail,
  onRetry,
  className = 'mt-6',
}: {
  title: string
  /** Mensaje técnico, pequeño, para cuando haya que pedir soporte. */
  detail?: string | null
  onRetry?: () => void
  className?: string
}) {
  return (
    <div role="alert" className={`${card} ${className} flex flex-col items-center px-5 py-10 text-center`}>
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ember-500/15 text-ember-400">
        <AlertTriangleIcon className="h-5 w-5" />
      </span>
      <p className="mt-3 font-semibold text-white">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-white/60">
        Revisa la conexión a internet y vuelve a intentarlo. Si sigue fallando, avísale a soporte.
      </p>
      {detail && <p className="mt-2 max-w-sm break-words font-mono text-xs text-white/50">{detail}</p>}
      {onRetry && (
        <button type="button" onClick={onRetry} className={`${buttonPrimary} mt-5`}>
          Reintentar
        </button>
      )}
    </div>
  )
}

export function EmptyState({
  title,
  description,
  action,
  className = 'mt-6',
}: {
  title: string
  description?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={`${card} ${className} flex flex-col items-center px-5 py-10 text-center`}>
      <p className="font-semibold text-white">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-white/60">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
