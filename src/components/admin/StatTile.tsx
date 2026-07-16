import type { ComponentType } from 'react'

interface StatTileProps {
  label: string
  value: string
  icon: ComponentType<{ className?: string }>
  accent?: 'white' | 'electric' | 'hazard' | 'ember'
}

const accentClasses: Record<NonNullable<StatTileProps['accent']>, string> = {
  white: 'text-white',
  electric: 'text-electric-400',
  hazard: 'text-hazard-400',
  ember: 'text-ember-400',
}

export function StatTile({ label, value, icon: Icon, accent = 'white' }: StatTileProps) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-ink-800 p-4 sm:p-5">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 ${accentClasses[accent]}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold uppercase tracking-wide text-white/50">{label}</p>
        <p className={`font-mono-price text-2xl font-bold ${accentClasses[accent]}`}>{value}</p>
      </div>
    </div>
  )
}
