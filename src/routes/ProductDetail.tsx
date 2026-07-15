import { useState } from 'react'
import { Link, useOutletContext, useParams } from 'react-router-dom'
import { useProduct } from '../hooks/useProduct'
import { formatCOP } from '../lib/format'
import { buildProductInquiryLink, GENERAL_INQUIRY_LINK } from '../lib/whatsapp'
import { vehicleLabels } from '../data/vehicleLabels'
import { WhatsAppIcon } from '../components/layout/Header'
import type { Category } from '../types/product'

export default function ProductDetail() {
  const { slug } = useParams()
  const { status, data: product, error } = useProduct(slug)
  const categoriesState = useOutletContext<{ data: Category[] }>()

  if (status === 'loading') {
    return (
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-2xl bg-paper-100" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 animate-pulse rounded bg-paper-100" />
            <div className="h-4 w-full animate-pulse rounded bg-paper-100" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-paper-100" />
            <div className="h-10 w-1/2 animate-pulse rounded bg-paper-100" />
          </div>
        </div>
      </section>
    )
  }

  if (status === 'error') {
    return (
      <section className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <p className="font-display text-xl uppercase text-ink-900">No pudimos cargar este producto</p>
        <p className="mt-2 text-sm text-ink-900/60">{error ?? 'Intenta de nuevo en un momento.'}</p>
        <a
          href={GENERAL_INQUIRY_LINK}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-electric-500 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-electric-400"
        >
          Escribir por WhatsApp
        </a>
      </section>
    )
  }

  if (status === 'not-found' || !product) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <p className="font-display text-xl uppercase text-ink-900">Producto no encontrado</p>
        <p className="mt-2 text-sm text-ink-900/60">
          Puede que ya no esté disponible. Mira el resto del catálogo.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-electric-500 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-electric-400"
        >
          Ver catálogo
        </Link>
      </section>
    )
  }

  const gallery = product.images && product.images.length > 0 ? product.images : [product.image]
  const categoryName =
    categoriesState.data.find((c) => c.slug === product.categorySlug)?.name ?? product.categorySlug

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-ink-900/50 sm:text-sm">
        <Link to="/" className="hover:text-electric-500">
          Inicio
        </Link>
        <span>/</span>
        <Link to={`/categoria/${product.categorySlug}`} className="hover:text-electric-500">
          {categoryName}
        </Link>
        <span>/</span>
        <span className="text-ink-900/70">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <Gallery images={gallery} name={product.name} />

        <div>
          <span className="inline-flex items-center gap-1 rounded-full bg-ink-900/5 px-2.5 py-1 text-xs font-semibold text-ink-900/70">
            {vehicleLabels[product.vehicleType]}
          </span>

          <h1 className="mt-3 font-display text-2xl uppercase leading-tight text-ink-900 sm:text-3xl">
            {product.name}
          </h1>

          {product.description.length > 0 && (
            <ul className="mt-5 space-y-2 text-sm text-ink-900/70 sm:text-base">
              {product.description.map((line) => (
                <li key={line} className="flex gap-2">
                  <span className="mt-0.5 text-electric-500">✓</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6 flex flex-wrap items-end gap-4 rounded-2xl border border-ink-900/10 bg-white p-5 font-mono-price">
            <div>
              <p className="text-xs uppercase tracking-wide text-ink-900/40">Producto</p>
              <p className="text-2xl font-bold text-ink-900 sm:text-3xl">{formatCOP(product.price)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-ember-500">Instalación</p>
              <p className="text-lg font-bold text-ember-500">{formatCOP(product.installPrice)}</p>
            </div>
          </div>

          <a
            href={buildProductInquiryLink(product)}
            target="_blank"
            rel="noreferrer"
            className="mt-6 flex items-center justify-center gap-2 rounded-full bg-electric-500 py-3.5 text-sm font-bold text-white transition hover:bg-electric-400"
          >
            <WhatsAppIcon className="h-5 w-5" />
            Pedir por WhatsApp
          </a>

          <Link
            to={`/categoria/${product.categorySlug}`}
            className="mt-4 block text-center text-sm font-semibold text-ink-900/50 transition hover:text-electric-500"
          >
            ← Ver más en esta categoría
          </Link>
        </div>
      </div>
    </section>
  )
}

function Gallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0)

  return (
    <div>
      <div className="aspect-square overflow-hidden rounded-2xl border border-ink-900/10 bg-paper-100">
        <img src={images[active]} alt={name} className="h-full w-full object-cover" />
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setActive(index)}
              className={`h-16 w-16 overflow-hidden rounded-lg border-2 transition ${
                index === active ? 'border-electric-500' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img src={image} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
