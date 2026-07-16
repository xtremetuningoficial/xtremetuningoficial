import type { ComponentType } from 'react'

interface StatTileProps {
  label: string
  value: string
  icon: ComponentType<{ className?: string }>
  accent?: 'white' | 'electric' | 'hazard' | 'ember'
}

const textAccentClasses: Record<NonNullable<StatTileProps['accent']>, string> = {
  white: 'text-white',
  electric: 'text-electric-400',
  hazard: 'text-hazard-400',
  ember: 'text-ember-400',
}

const barAccentClasses: Record<NonNullable<StatTileProps['accent']>, string> = {
  white: 'bg-white/20',
  electric: 'bg-electric-400',
  hazard: 'bg-hazard-400',
  ember: 'bg-ember-400',
}

export function StatTile({ label, value, icon: Icon, accent = 'white' }: StatTileProps) {
  return (
    <div className="relative flex items-center gap-3 overflow-hidden rounded-2xl border border-white/10 bg-ink-800 p-4 sm:p-5">
      <span className={`absolute inset-x-0 top-0 h-0.5 ${barAccentClasses[accent]}`} aria-hidden="true" />
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 ${textAccentClasses[accent]}`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold uppercase tracking-wide text-white/50">{label}</p>
        <p className={`truncate font-mono-price text-lg font-bold sm:text-2xl ${textAccentClasses[accent]}`}>
          {value}
        </p>
      </div>
    </div>
  )
}
