import { useEffect, useState } from 'react'
import { adjustStock, fetchMovements } from '../../lib/api/inventory'
import { formatDateTime } from '../../lib/format'
import { getErrorMessage } from '../../lib/errors'
import { Tooltip } from '../ui/Tooltip'
import { MOVEMENT_REASON_LABELS, type InventoryMovement, type MovementReason } from '../../types/admin'

interface StockAdjusterProps {
  productId: string
  stock: number
  onStockChange: (newStock: number) => void
}

export function StockAdjuster({ productId, stock, onStockChange }: StockAdjusterProps) {
  const [movements, setMovements] = useState<InventoryMovement[]>([])
  const [loadingMovements, setLoadingMovements] = useState(true)
  const [amount, setAmount] = useState(1)
  const [reason, setReason] = useState<MovementReason>('ingreso_mercancia')
  const [note, setNote] = useState('')
  const [applying, setApplying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function loadMovements() {
    setLoadingMovements(true)
    fetchMovements(productId)
      .then(setMovements)
      .catch(() => {})
      .finally(() => setLoadingMovements(false))
  }

  useEffect(() => {
    loadMovements()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId])

  async function apply(sign: 1 | -1) {
    setError(null)
    setApplying(true)
    try {
      const newStock = await adjustStock(productId, amount * sign, reason, note.trim() || undefined)
      onStockChange(newStock)
      setNote('')
      loadMovements()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setApplying(false)
    }
  }

  return (
    <div className="rounded-2xl border border-ink-900/10 bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-900/60">Inventario</p>
      <p className="mt-2 font-mono-price text-3xl font-bold text-ink-900">
        {stock} <span className="text-sm font-normal text-ink-900/60">en stock</span>
      </p>

      <div className="mt-4 space-y-2">
        <div className="flex gap-2">
          <Tooltip label="Cantidad de unidades a mover">
            <input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(Math.max(1, Number(e.target.value)))}
              aria-label="Cantidad de unidades a mover"
              className="input w-20"
            />
          </Tooltip>
          <Tooltip label="Motivo del movimiento" className="flex-1">
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as MovementReason)}
              aria-label="Motivo del movimiento"
              className="input"
            >
              {Object.entries(MOVEMENT_REASON_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Tooltip>
        </div>

        <input
          type="text"
          placeholder="Nota (opcional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          aria-label="Nota del movimiento (opcional)"
          className="input"
        />

        <div className="flex gap-2">
          <Tooltip label="Sumar unidades al stock (ej. llegó mercancía)" className="flex-1">
            <button
              type="button"
              disabled={applying}
              onClick={() => apply(1)}
              className="w-full rounded-full bg-electric-500 py-2 text-sm font-bold text-white transition hover:bg-electric-400 disabled:opacity-60"
            >
              + Entrada
            </button>
          </Tooltip>
          <Tooltip label="Restar unidades del stock (ej. venta en tienda)" className="flex-1">
            <button
              type="button"
              disabled={applying}
              onClick={() => apply(-1)}
              className="w-full rounded-full border border-ember-500 py-2 text-sm font-bold text-ember-500 transition hover:bg-ember-500/10 disabled:opacity-60"
            >
              − Salida
            </button>
          </Tooltip>
        </div>

        {error && <p className="text-xs text-ember-500">{error}</p>}
      </div>

      <div className="mt-5 border-t border-ink-900/10 pt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-900/60">Historial</p>

        {loadingMovements ? (
          <p className="mt-2 text-xs text-ink-900/60">Cargando...</p>
        ) : movements.length === 0 ? (
          <p className="mt-2 text-xs text-ink-900/60">Sin movimientos todavía.</p>
        ) : (
          <ul className="mt-2 max-h-56 space-y-2 overflow-y-auto text-xs">
            {movements.map((movement) => (
              <li key={movement.id} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span
                    className={`font-mono-price font-bold ${movement.change >= 0 ? 'text-electric-500' : 'text-ember-500'}`}
                  >
                    {movement.change >= 0 ? '+' : ''}
                    {movement.change}
                  </span>
                  <span className="ml-2 text-ink-900/60">{MOVEMENT_REASON_LABELS[movement.reason]}</span>
                  {movement.note && (
                    <span className="ml-1 truncate text-ink-900/60">— {movement.note}</span>
                  )}
                </div>
                <span className="shrink-0 font-mono-price text-ink-900/30">
                  {formatDateTime(movement.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
