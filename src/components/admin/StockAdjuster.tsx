import { useId, useRef, useState, type KeyboardEvent } from 'react'
import { adjustStock, fetchMovements } from '../../lib/api/inventory'
import { formatDateTime } from '../../lib/format'
import { getErrorMessage } from '../../lib/errors'
import { useAsync } from '../../hooks/useAsync'
import { useAdminFeedback } from './AdminFeedback'
import { card } from './ui'
import { MOVEMENT_REASON_LABELS, type MovementReason } from '../../types/admin'

interface StockAdjusterProps {
  productId: string
  stock: number
  onStockChange: (newStock: number) => void
}

export function StockAdjuster({ productId, stock, onStockChange }: StockAdjusterProps) {
  const movements = useAsync(() => fetchMovements(productId), [productId])
  const { notify } = useAdminFeedback()
  const [amount, setAmount] = useState(1)
  const [reason, setReason] = useState<MovementReason>('ingreso_mercancia')
  const [note, setNote] = useState('')
  const [applying, setApplying] = useState(false)
  const applyingRef = useRef(false)
  const [error, setError] = useState<string | null>(null)
  const amountId = useId()
  const reasonId = useId()
  const noteId = useId()
  const errorId = useId()

  async function apply(sign: 1 | -1) {
    if (applyingRef.current) return
    if (!Number.isInteger(amount) || amount < 1) {
      setError('La cantidad debe ser un número entero, 1 o más.')
      return
    }
    if (sign === -1 && amount > stock) {
      setError(`Solo hay ${stock} en stock: no se pueden sacar ${amount}.`)
      return
    }
    setError(null)
    applyingRef.current = true
    setApplying(true)
    try {
      const newStock = await adjustStock(productId, amount * sign, reason, note.trim() || undefined)
      onStockChange(newStock)
      setNote('')
      notify(`${sign === 1 ? 'Entraron' : 'Salieron'} ${amount} ${amount === 1 ? 'unidad' : 'unidades'}. Quedan ${newStock}.`)
      movements.reload()
    } catch (err) {
      setError(`No pudimos registrar el movimiento: ${getErrorMessage(err)}`)
    } finally {
      applyingRef.current = false
      setApplying(false)
    }
  }

  // Este bloque vive dentro del formulario del producto: Enter aquí no debe guardar el producto.
  function preventFormSubmit(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter' && event.target instanceof HTMLInputElement) event.preventDefault()
  }

  return (
    <div className={`${card} p-5`} onKeyDown={preventFormSubmit}>
      <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400">Inventario</h2>
      <p className="mt-2 font-mono-price text-3xl font-bold text-white" aria-live="polite">
        {stock} <span className="text-sm font-normal text-white/60">en stock</span>
      </p>

      <div className="mt-4 space-y-3">
        <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-2">
          <div>
            <label htmlFor={amountId} className="mb-1 block text-xs font-semibold text-white/70">
              Cantidad
            </label>
            <input
              id={amountId}
              type="number"
              min={1}
              step={1}
              inputMode="numeric"
              value={amount}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
              onChange={(e) => setAmount(Math.max(1, Math.round(Number(e.target.value) || 1)))}
              className="input font-mono-price"
            />
          </div>
          <div>
            <label htmlFor={reasonId} className="mb-1 block text-xs font-semibold text-white/70">
              Motivo
            </label>
            <select
              id={reasonId}
              value={reason}
              onChange={(e) => setReason(e.target.value as MovementReason)}
              className="input"
            >
              {Object.entries(MOVEMENT_REASON_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor={noteId} className="mb-1 block text-xs font-semibold text-white/70">
            Nota (opcional)
          </label>
          <input
            id={noteId}
            type="text"
            placeholder="Ej. factura 123"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="input"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={applying}
            onClick={() => apply(1)}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-electric-500 px-3 text-sm font-bold text-white transition hover:bg-electric-600 disabled:opacity-60"
          >
            {applying ? 'Guardando…' : '+ Entrada'}
          </button>
          <button
            type="button"
            disabled={applying}
            onClick={() => apply(-1)}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-ember-400 px-3 text-sm font-bold text-ember-400 transition hover:bg-ember-500/10 disabled:opacity-60"
          >
            − Salida
          </button>
        </div>
        <p className="text-xs text-white/55">Entrada: llegó mercancía. Salida: venta en tienda u otro motivo.</p>

        {error && (
          <p id={errorId} role="alert" className="text-xs font-semibold text-ember-400">
            {error}
          </p>
        )}
      </div>

      <div className="mt-5 border-t border-white/10 pt-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-white/60">Historial</h3>

        {movements.status === 'loading' ? (
          <div className="mt-2 space-y-2" aria-busy="true">
            <span className="sr-only">Cargando historial…</span>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-4 animate-pulse rounded bg-white/5" aria-hidden="true" />
            ))}
          </div>
        ) : movements.status === 'error' ? (
          <div className="mt-2 flex items-center justify-between gap-2">
            <p className="text-xs text-ember-400">No pudimos cargar el historial.</p>
            <button
              type="button"
              onClick={movements.reload}
              className="inline-flex min-h-11 items-center rounded-lg px-3 text-xs font-bold text-white transition hover:bg-white/5"
            >
              Reintentar
            </button>
          </div>
        ) : !movements.data || movements.data.length === 0 ? (
          <p className="mt-2 text-xs text-white/60">Sin movimientos todavía. El primero aparece aquí.</p>
        ) : (
          <ul className="mt-2 max-h-56 space-y-2 overflow-y-auto text-xs">
            {movements.data.map((movement) => (
              <li key={movement.id} className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span
                    className={`font-mono-price font-bold ${movement.change >= 0 ? 'text-electric-400' : 'text-ember-400'}`}
                  >
                    {movement.change >= 0 ? '+' : ''}
                    {movement.change}
                  </span>
                  <span className="ml-2 text-white/70">{MOVEMENT_REASON_LABELS[movement.reason]}</span>
                  {movement.note && <span className="ml-1 break-words text-white/55">— {movement.note}</span>}
                </div>
                <span className="shrink-0 font-mono-price text-white/55">{formatDateTime(movement.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
