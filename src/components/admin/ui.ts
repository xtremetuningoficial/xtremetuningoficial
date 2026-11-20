// Clases compartidas del panel: el mismo botón se ve igual en todas las pantallas.
// Todos los controles miden al menos 44 px de alto para el uso con el dedo.

export const buttonPrimary =
  'inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full bg-electric-500 px-5 text-sm font-bold text-white transition hover:bg-electric-600 disabled:cursor-not-allowed disabled:opacity-60'

export const buttonSecondary =
  'inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-white/20 px-5 text-sm font-bold text-white transition hover:border-white/40 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60'

export const buttonDanger =
  'inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full bg-ember-500 px-5 text-sm font-bold text-white transition hover:bg-ember-500/85 disabled:cursor-not-allowed disabled:opacity-60'

export const buttonDangerGhost =
  'inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full px-4 text-sm font-semibold text-ember-400 transition hover:bg-ember-500/10 disabled:cursor-not-allowed disabled:opacity-60'

const iconButtonBase =
  'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white/70 transition disabled:cursor-not-allowed disabled:opacity-40'

export const iconButton = `${iconButtonBase} hover:bg-white/5 hover:text-electric-400`

export const iconButtonDanger = `${iconButtonBase} hover:bg-ember-500/10 hover:text-ember-400`

export const card = 'rounded-2xl border border-white/10 bg-ink-800'
