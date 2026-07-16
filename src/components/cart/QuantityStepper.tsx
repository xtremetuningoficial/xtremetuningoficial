interface QuantityStepperProps {
  quantity: number
  onIncrease: () => void
  onDecrease: () => void
  size?: 'sm' | 'md'
}

export function QuantityStepper({ quantity, onIncrease, onDecrease, size = 'md' }: QuantityStepperProps) {
  const height = size === 'sm' ? 'h-9' : 'h-11'

  return (
    <div className={`flex ${height} items-center justify-between rounded-full border border-electric-500 bg-electric-500/5`}>
      <button
        type="button"
        onClick={onDecrease}
        aria-label="Quitar una unidad"
        className="flex h-full w-10 items-center justify-center text-lg font-bold text-electric-500 transition hover:bg-electric-500/10"
      >
        −
      </button>
      <span className="font-mono-price text-sm font-bold text-ink-900">{quantity}</span>
      <button
        type="button"
        onClick={onIncrease}
        aria-label="Agregar una unidad"
        className="flex h-full w-10 items-center justify-center text-lg font-bold text-electric-500 transition hover:bg-electric-500/10"
      >
        +
      </button>
    </div>
  )
}
