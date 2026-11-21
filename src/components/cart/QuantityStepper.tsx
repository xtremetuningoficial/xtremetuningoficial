interface QuantityStepperProps {
  quantity: number
  onIncrease: () => void
  onDecrease: () => void
  size?: 'sm' | 'md'
}

export function QuantityStepper({ quantity, onIncrease, onDecrease, size = 'md' }: QuantityStepperProps) {
  // Los dos tamaños dejan botones de 44 × 44 px (el borde va por fuera); "sm" es más angosto.
  const width = size === 'sm' ? 'gap-1' : ''

  return (
    <div className={`flex ${width} items-center justify-between rounded-full border border-electric-500 bg-electric-500/5`}>
      <button
        type="button"
        onClick={onDecrease}
        aria-label="Quitar una unidad"
        className="flex h-11 w-11 items-center justify-center text-lg font-bold text-electric-500 transition hover:bg-electric-500/10"
      >
        −
      </button>
      <span className="font-mono-price text-sm font-bold text-ink-900">{quantity}</span>
      <button
        type="button"
        onClick={onIncrease}
        aria-label="Agregar una unidad"
        className="flex h-11 w-11 items-center justify-center text-lg font-bold text-electric-500 transition hover:bg-electric-500/10"
      >
        +
      </button>
    </div>
  )
}
