import { Link } from 'react-router-dom'
import type { Product } from '../../types/product'
import { formatCOP } from '../../lib/format'
import { vehicleLabels } from '../../data/vehicleLabels'
import { useCart } from '../../context/CartContext'
import { QuantityStepper } from '../cart/QuantityStepper'

export function ProductCard({ product }: { product: Product }) {
  const { quantityOf, addItem, setQuantity } = useCart()
  const quantity = quantityOf(product.slug)

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-ink-900/10 bg-white transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-ink-900/5">
      <Link to={`/producto/${product.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-paper-100">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        {product.featured && (
          <span className="absolute left-3 top-3 rounded-full bg-hazard-400 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-ink-900">
            Más pedido
          </span>
        )}
        <span className="absolute right-3 top-3 rounded-full bg-ink-900/80 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
          {vehicleLabels[product.vehicleType]}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <Link to={`/producto/${product.slug}`}>
          <h3 className="font-display text-base uppercase leading-tight text-ink-900 transition group-hover:text-electric-500 sm:text-lg">
            {product.name}
          </h3>
        </Link>

        <ul className="mt-2.5 space-y-1 text-xs text-ink-900/60 sm:text-sm">
          {product.description.slice(0, 2).map((line) => (
            <li key={line} className="flex gap-1.5">
              <span className="text-electric-500">✓</span>
              <span className="leading-snug">{line}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex flex-1 items-end justify-between gap-3">
          <div className="font-mono-price">
            <p className="text-lg font-bold text-ink-900 sm:text-xl">{formatCOP(product.price)}</p>
            <p className="mt-0.5 inline-flex items-center gap-1 rounded bg-ember-500/10 px-1.5 py-0.5 text-[11px] font-semibold text-ember-500">
              + instalación {formatCOP(product.installPrice)}
            </p>
          </div>
        </div>

        {quantity > 0 ? (
          <div className="mt-4">
            <QuantityStepper
              quantity={quantity}
              onIncrease={() => setQuantity(product.slug, quantity + 1)}
              onDecrease={() => setQuantity(product.slug, quantity - 1)}
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => addItem(product.slug)}
            className="mt-4 flex items-center justify-center gap-2 rounded-full bg-electric-500 py-2.5 text-sm font-bold text-white transition hover:bg-electric-400"
          >
            Agregar al carrito
          </button>
        )}
      </div>
    </article>
  )
}
