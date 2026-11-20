interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  label?: string
  /** id de un texto visible que nombra el interruptor (en lugar de `label`). */
  labelledBy?: string
}

// El riel se ve de 24 px, pero el botón ocupa 44 × 52 px para tocarlo con el dedo.
export function Switch({ checked, onChange, disabled, label, labelledBy }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={labelledBy ? undefined : label}
      aria-labelledby={labelledBy}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="group/switch -mx-1 inline-flex h-11 w-[3.25rem] shrink-0 items-center justify-center rounded-full disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span
        aria-hidden="true"
        className={`relative h-6 w-11 rounded-full transition-colors ${
          checked ? 'bg-electric-500' : 'bg-white/20 group-hover/switch:bg-white/25'
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </span>
    </button>
  )
}
