import { Link } from 'react-router-dom'
import type { Product } from '../../types/product'
import type { RatingSummary } from '../../types/review'
import { cardBullets, displayName, formatCOP } from '../../lib/format'
import { vehicleLabels } from '../../data/vehicleLabels'
import { useCart } from '../../context/CartContext'
import { QuantityStepper } from '../cart/QuantityStepper'
import { StarRating } from '../reviews/StarRating'
import { CartIcon, CheckIcon } from '../icons'

// Tarjeta compacta: en celular van dos por fila, así que aquí sólo vive lo que sirve para
// decidir de un vistazo (foto, nombre, precio, instalación). Las viñetas largas quedan para
// la ficha; desde 640 px se asoman las dos primeras.
export function ProductCard({ product, rating }: { product: Product; rating?: RatingSummary }) {
  const { quantityOf, addItem, setQuantity } = useCart()
  const quantity = quantityOf(product.slug)
  const vehicle = vehicleLabels[product.vehicleType]
  const VehicleIcon = vehicle.icon
  const name = displayName(product.name)
  const bullets = cardBullets(product.description)
  const href = `/producto/${product.slug}`

  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-xl border border-ink-900/10 bg-white transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-ink-900/5 sm:rounded-2xl">
      <Link to={href} tabIndex={-1} aria-hidden="true" className="relative block aspect-square overflow-hidden bg-paper-100 sm:aspect-[4/3]">
        {product.image && (
          <img
            src={product.image}
            alt=""
            loading="lazy"
            decoding="async"
            width={600}
            height={600}
            sizes="(min-width: 1280px) 300px, (min-width: 1024px) 33vw, 50vw"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        )}
        {product.featured && (
          <span className="absolute left-2 top-2 rounded-full bg-hazard-400 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-ink-900 sm:left-3 sm:top-3 sm:px-2.5 sm:py-1">
            Más pedido
          </span>
        )}
        <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-ink-900/80 p-1.5 text-[11px] font-semibold text-white sm:right-3 sm:top-3 sm:px-2.5 sm:py-1">
          <VehicleIcon className="h-3 w-3" />
          <span className="hidden sm:inline">{vehicle.label}</span>
        </span>
        {product.discountPercent > 0 && (
          <span className="absolute bottom-2 left-2 rounded-md bg-ember-500 px-1.5 py-1 font-mono-price text-xs font-bold leading-none text-white shadow-md shadow-ink-900/20 sm:bottom-3 sm:left-3 sm:px-2 sm:text-sm">
            −{product.discountPercent} %
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-3 sm:p-5">
        <h3 className="font-display text-sm uppercase leading-tight text-ink-900 sm:text-lg">
          <Link to={href} className="line-clamp-2 min-h-11 break-words sm:min-h-[2.6em] transition group-hover:text-electric-500 hover:text-electric-500">
            {name}
            <span className="sr-only">, para {vehicle.label.toLowerCase()}</span>
          </Link>
        </h3>

        {rating && rating.count > 0 && (
          <div className="mt-1 flex items-center gap-1.5">
            <StarRating value={rating.average} size="sm" />
            <span className="text-xs text-ink-900/60">({rating.count})</span>
          </div>
        )}

        {bullets.length > 0 && (
          <ul className="mt-2 hidden space-y-1 text-sm text-ink-900/65 sm:block">
            {bullets.map((line) => (
              <li key={line} className="flex gap-1.5">
                <CheckIcon className="mt-0.5 h-3 w-3 shrink-0 text-electric-500" />
                <span className="line-clamp-1 leading-snug">{line}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto pt-3 font-mono-price sm:pt-4">
          {product.discountPercent > 0 && (
            <p className="text-xs text-ink-900/60">
              <span className="sr-only">Antes </span>
              <s>{formatCOP(product.regularPrice)}</s>
            </p>
          )}
          <p className={`text-base font-bold leading-tight sm:text-xl ${product.discountPercent > 0 ? 'text-ember-500' : 'text-ink-900'}`}>
            {formatCOP(product.price)}
          </p>
          {/* Instalación en 0 = no aplica (ceras, limpiadores): no se muestra, pero se guarda
              el alto para que las tarjetas de la fila queden parejas. */}
          <p className="mt-0.5 min-h-4 text-[11px] leading-4 text-electric-600 sm:text-xs">
            {product.installPrice > 0 && <>+ instalación {formatCOP(product.installPrice)}</>}
          </p>
        </div>

        {quantity > 0 ? (
          <div className="mt-3">
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
            aria-label={`Agregar ${name} al carrito`}
            className="mt-3 flex min-h-11 items-center justify-center gap-1.5 rounded-full bg-electric-500 px-3 text-sm font-bold text-white transition hover:bg-electric-400 active:scale-[0.98]"
          >
            <CartIcon className="h-4 w-4 shrink-0" />
            <span className="sm:hidden">Agregar</span>
            <span className="hidden sm:inline">Agregar al carrito</span>
          </button>
        )}
      </div>
    </article>
  )
}
