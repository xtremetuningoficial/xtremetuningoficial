import { formatCOP } from '../../lib/format'
import {
  applyDiscount,
  dateInputToBogotaNoon,
  formatDiscountEnd,
  MAX_DISCOUNT_PERCENT,
  toBogotaDateInput,
} from '../../lib/pricing'
import type { ProductFormValues } from '../../types/admin'
import { FormField } from './FormField'

const DISCOUNT_PRESETS = [10, 15, 20, 30]

type DiscountPatch = Partial<Pick<ProductFormValues, 'discountPercent' | 'discountEndsOn'>>

interface DiscountFieldsProps {
  price: number
  percent: number
  endsOn: string
  onChange: (patch: DiscountPatch) => void
  disabled?: boolean
}

export function DiscountFields({ price, percent, endsOn, onChange, disabled }: DiscountFieldsProps) {
  const today = toBogotaDateInput(new Date().toISOString())
  const hasDiscount = percent > 0
  const expired = hasDiscount && endsOn !== '' && endsOn < today
  const active = hasDiscount && !expired
  const finalPrice = applyDiscount(price, percent)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Descuentos rápidos">
        {[0, ...DISCOUNT_PRESETS].map((preset) => {
          const selected = percent === preset
          return (
            <button
              key={preset}
              type="button"
              disabled={disabled}
              aria-pressed={selected}
              onClick={() =>
                onChange(preset === 0 ? { discountPercent: 0, discountEndsOn: '' } : { discountPercent: preset })
              }
              className={`inline-flex min-h-11 items-center rounded-full border px-4 font-mono-price text-sm font-bold transition disabled:opacity-50 ${
                selected
                  ? preset === 0
                    ? 'border-white/40 bg-white/10 text-white'
                    : 'border-ember-400 bg-ember-400 text-ink-900'
                  : 'border-white/20 text-white/70 hover:border-white/35 hover:text-white'
              }`}
            >
              {preset === 0 ? 'Sin descuento' : `−${preset} %`}
            </button>
          )
        })}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Porcentaje (%)" hint={`Entre 0 y ${MAX_DISCOUNT_PERCENT}.`}>
          <input
            type="number"
            min={0}
            max={MAX_DISCOUNT_PERCENT}
            step={1}
            inputMode="numeric"
            disabled={disabled}
            value={percent}
            onChange={(e) => {
              const value = Math.min(MAX_DISCOUNT_PERCENT, Math.max(0, Math.round(Number(e.target.value) || 0)))
              onChange(value === 0 ? { discountPercent: 0, discountEndsOn: '' } : { discountPercent: value })
            }}
            className="input font-mono-price"
          />
        </FormField>
        <FormField
          label="Válido hasta (opcional)"
          hint={hasDiscount ? 'Vacío = sin fecha de fin.' : 'Primero elige un porcentaje.'}
          error={expired ? 'Esa fecha ya pasó.' : null}
        >
          <input
            type="date"
            min={today}
            disabled={disabled || !hasDiscount}
            value={endsOn}
            onChange={(e) => onChange({ discountEndsOn: e.target.value })}
            className="input font-mono-price"
          />
        </FormField>
      </div>

      <div
        aria-live="polite"
        className={`rounded-xl border px-4 py-3 text-sm ${
          expired
            ? 'border-hazard-400/30 bg-hazard-400/10 text-hazard-400'
            : active
              ? 'border-ember-400/30 bg-ember-400/10 text-white'
              : 'border-white/10 text-white/60'
        }`}
      >
        {expired ? (
          <>
            Este descuento venció el {formatDiscountEnd(dateInputToBogotaNoon(endsOn))}. Cambia la fecha o quítalo.
          </>
        ) : active ? (
          <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-white/70">En la tienda se verá:</span>
            <span className="font-mono-price text-white/55 line-through">{formatCOP(price)}</span>
            <span className="font-mono-price text-base font-bold text-white">{formatCOP(finalPrice)}</span>
            <span className="font-mono-price text-xs font-semibold text-ember-400">
              ahorra {formatCOP(price - finalPrice)}
              {endsOn ? ` · hasta el ${formatDiscountEnd(dateInputToBogotaNoon(endsOn))}` : ' · sin fecha de fin'}
            </span>
          </span>
        ) : (
          <>Sin descuento. El producto se vende a {formatCOP(price)}. La instalación nunca se descuenta.</>
        )}
      </div>
    </div>
  )
}
