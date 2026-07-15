import type { CartInquiryItem } from '../../lib/whatsapp'
import { formatCOP } from '../../lib/format'
import { buildCartInquiryLink } from '../../lib/whatsapp'
import { WhatsAppIcon } from '../layout/Header'

export function CartSummary({ items, onClear }: { items: CartInquiryItem[]; onClear: () => void }) {
  const productsTotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const installTotal = items.reduce((sum, item) => sum + item.product.installPrice * item.quantity, 0)

  return (
    <div className="rounded-2xl border border-ink-900/10 bg-white p-5 sm:p-6">
      <h2 className="font-display text-lg uppercase text-ink-900">Resumen del pedido</h2>

      <dl className="mt-4 space-y-2 font-mono-price text-sm">
        <div className="flex justify-between text-ink-900/70">
          <dt>Productos</dt>
          <dd>{formatCOP(productsTotal)}</dd>
        </div>
        <div className="flex justify-between text-ember-500">
          <dt>Instalación</dt>
          <dd>{formatCOP(installTotal)}</dd>
        </div>
        <div className="flex justify-between border-t border-ink-900/10 pt-2 text-base font-bold text-ink-900">
          <dt>Total</dt>
          <dd>{formatCOP(productsTotal + installTotal)}</dd>
        </div>
      </dl>

      <a
        href={buildCartInquiryLink(items)}
        target="_blank"
        rel="noreferrer"
        className="mt-6 flex items-center justify-center gap-2 rounded-full bg-electric-500 py-3.5 text-sm font-bold text-white transition hover:bg-electric-400"
      >
        <WhatsAppIcon className="h-5 w-5" />
        Enviar pedido por WhatsApp
      </a>

      <p className="mt-3 text-center text-xs text-ink-900/40">
        Coordinamos disponibilidad, pago e instalación por WhatsApp.
      </p>

      <button
        type="button"
        onClick={onClear}
        className="mt-4 block w-full text-center text-xs font-semibold text-ink-900/40 transition hover:text-ember-500"
      >
        Vaciar carrito
      </button>
    </div>
  )
}
