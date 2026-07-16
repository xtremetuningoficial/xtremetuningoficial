import { Link } from 'react-router-dom'
import type { Product } from '../../types/product'
import { formatCOP } from '../../lib/format'
import { useCart } from '../../context/CartContext'
import { QuantityStepper } from './QuantityStepper'
import { Tooltip } from '../ui/Tooltip'
import { CloseIcon } from '../icons'

export function CartItem({ product, quantity }: { product: Product; quantity: number }) {
  const { setQuantity, removeItem } = useCart()
  const subtotal = (product.price + product.installPrice) * quantity

  return (
    <div className="flex gap-4 border-b border-ink-900/10 py-5 last:border-0">
      <Link to={`/producto/${product.slug}`} className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-paper-100 sm:h-24 sm:w-24">
        <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
      </Link>

      <div className="flex flex-1 flex-col justify-between gap-2">
        <div className="flex items-start justify-between gap-3">
          <Link to={`/producto/${product.slug}`}>
            <h3 className="font-display text-sm uppercase leading-tight text-ink-900 hover:text-electric-500 sm:text-base">
              {product.name}
            </h3>
          </Link>
          <Tooltip label="Quitar del carrito">
            <button
              type="button"
              onClick={() => removeItem(product.slug)}
              aria-label={`Quitar ${product.name} del carrito`}
              className="shrink-0 text-ink-900/60 transition hover:text-ember-500"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </Tooltip>
        </div>

        <p className="font-mono-price text-xs text-ink-900/60">
          {formatCOP(product.price)} + instalación {formatCOP(product.installPrice)}
        </p>

        <div className="flex items-center justify-between gap-3">
          <QuantityStepper
            size="sm"
            quantity={quantity}
            onIncrease={() => setQuantity(product.slug, quantity + 1)}
            onDecrease={() => setQuantity(product.slug, quantity - 1)}
          />
          <p className="font-mono-price text-sm font-bold text-ink-900 sm:text-base">
            {formatCOP(subtotal)}
          </p>
        </div>
      </div>
    </div>
  )
}
