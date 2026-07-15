import type { Product } from '../../types/product'
import { formatCOP } from '../../lib/format'
import { buildProductInquiryLink } from '../../lib/whatsapp'
import { WhatsAppIcon } from '../layout/Header'

const vehicleLabel: Record<Product['vehicleType'], string> = {
  carro: '🚗 Carro',
  moto: '🏍️ Moto',
  universal: '🔧 Universal',
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-ink-900/10 bg-white transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-ink-900/5">
      <div className="relative aspect-[4/3] overflow-hidden bg-paper-100">
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
          {vehicleLabel[product.vehicleType]}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="font-display text-base uppercase leading-tight text-ink-900 sm:text-lg">
          {product.name}
        </h3>

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

        <a
          href={buildProductInquiryLink(product)}
          target="_blank"
          rel="noreferrer"
          className="mt-4 flex items-center justify-center gap-2 rounded-full bg-electric-500 py-2.5 text-sm font-bold text-white transition hover:bg-electric-400"
        >
          <WhatsAppIcon className="h-4 w-4" />
          Pedir por WhatsApp
        </a>
      </div>
    </article>
  )
}
